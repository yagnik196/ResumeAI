export default function SkillBadge({ skill, type = 'found' }) {
  const isFound = type === 'found';
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
        isFound
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {skill}
    </span>
  );
}
