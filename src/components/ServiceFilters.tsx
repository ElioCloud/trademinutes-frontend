export default function ServiceFilters() {
  return (
   <div className="flex flex-wrap gap-2">
  <select className="border border-black rounded px-3 py-2 text-sm text-black">
    <option value="default" className="text-black">Delivery Time</option>
    <option value="24" className="text-black">24 Hours</option>
    <option value="72" className="text-black">3 Days</option>
    <option value="168" className="text-black">7 Days</option>
  </select>

  <select className="border border-black rounded px-3 py-2 text-sm text-black">
    <option value="default" className="text-black">Budget</option>
    <option className="text-black">$5 - $50</option>
    <option className="text-black">$50 - $200</option>
  </select>

  <select className="border border-black rounded px-3 py-2 text-sm text-black">
    <option value="default" className="text-black">Level</option>
    <option className="text-black">Beginner</option>
    <option className="text-black">Top Rated</option>
  </select>

  <select className="border border-black rounded px-3 py-2 text-sm text-black">
    <option value="default" className="text-black">Location</option>
    <option className="text-black">Remote</option>
    <option className="text-black">Nearby</option>
  </select>
</div>

  );
}
