import io
import uuid
import os
from PIL import Image, UnidentifiedImageError
from supabase import create_client, Client
from app.models.event_media import EventMedia
from sqlalchemy.ext.asyncio import AsyncSession

# config via env (adjust in your .env)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "event-banners")
SUPABASE_PUBLIC = os.getenv("SUPABASE_PUBLIC", "false").lower() == "true"

# limits
MAX_MEDIA_BYTES = int(os.getenv("MAX_MEDIA_BYTES", 4 * 1024 * 1024))  # 4 MB default
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


async def upload_media(session: AsyncSession, file, event_id: str):
    import io
    from PIL import Image

    content = await file.read()

    # Open + compress
    img = Image.open(io.BytesIO(content)).convert("RGB")
    compressed_bytes = io.BytesIO()
    img.save(compressed_bytes, format="JPEG", optimize=True, quality=85)
    compressed_bytes.seek(0)

    file_id = str(uuid.uuid4())
    file_path = f"events/{event_id}/media/{file_id}.jpg"   # recommended path

    # Upload to Supabase
    result = supabase.storage.from_(SUPABASE_BUCKET).upload(
        file_path,
        compressed_bytes.getvalue(),
        file_options={"content-type": "image/jpeg"}
    )

    # Check result
    if hasattr(result, "error") and result.error:
        raise Exception(result.error.message)
    if isinstance(result, dict) and "error" in result:
        raise Exception(result["error"]["message"])

    # Build public URL
    file_url = (
        f"{SUPABASE_URL}/storage/v1/object/public/"
        f"{SUPABASE_BUCKET}/{file_path}"
    )

    # DB save
    media = EventMedia(
        event_id=event_id,
        file_url=file_url,
        file_type="banner"
    )
    session.add(media)
    await session.commit()
    await session.refresh(media)

    return media

async def delete_media(session: AsyncSession, media_id: str):
    """
    Delete DB record and remove object in Supabase.
    """
    media = await session.get(EventMedia, media_id)
    if not media:
        return False

    # Extract object path from our storage path structure
    # If public URL format: .../{bucket}/events/{event_id}/media/{uuid}.jpg
    # We want events/{event_id}/media/{uuid}.jpg
    # This split is tolerant if you change domain.
    try:
        bucket_key = media.file_url.split(f"{SUPABASE_BUCKET}/")[-1]
    except Exception:
        bucket_key = None

    if bucket_key:
        supabase.storage.from_(SUPABASE_BUCKET).remove([bucket_key])

    await session.delete(media)
    await session.commit()
    return True