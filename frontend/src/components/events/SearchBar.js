import React from 'react';
export default function SearchBar({value,onChange,onSubmit}){
  return (
    <form onSubmit={e=>{e.preventDefault(); onSubmit();}} className="p-2">
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder="Cari acara..." className="border p-2 rounded w-full" />
    </form>
  )
}
