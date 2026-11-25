export default function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon size={21} />
        </div>
      </div>

      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}