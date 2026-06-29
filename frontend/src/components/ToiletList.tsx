import type { Toilet } from "../types/Toilet";

type ToiletListProps = {
  toilets: Toilet[];
};

export function ToiletList({ toilets }: ToiletListProps) {
  if (toilets.length === 0) {
    return <p>No toilets found.</p>;
  }

  return (
    <section>
      <h2>Available toilets</h2>

      {toilets.map((toilet) => (
        <article key={toilet.id}>
          <h3>{toilet.name}</h3>
          <p>{toilet.address}</p>
          <p>{toilet.free ? "Free" : "Paid"}</p>
          <p>{toilet.publicToilet ? "Public" : "Private"}</p>
          <p>
            {toilet.requiresEntry
              ? "Requires entry"
              : "No entry required"}
          </p>
          <p>Cleanliness: {toilet.cleanlinessRating}/5</p>
        </article>
      ))}
    </section>
  );
}