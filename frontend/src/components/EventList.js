import React from 'react';
export default function EventList({events}){
  if(!events||events.length===0) return <div className="p-4">Tidak ada acara.</div>
  return (
    <ul className="p-2 space-y-3">
      {events.map(ev=> (
        <li key={ev.id} className="border rounded p-3 bg-white shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">{ev.title}</h3>
            <p className="text-sm">{new Date(ev.event_date).toLocaleString()}</p>
            <p className="text-sm">{ev.location}</p>
            <p className="mt-2 text-sm">{ev.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
