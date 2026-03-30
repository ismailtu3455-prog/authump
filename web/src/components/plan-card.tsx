import Link from "next/link";

type PlanCardProps = {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PlanCard({
  title,
  price,
  description,
  features,
  highlight,
  ctaHref,
  ctaLabel,
}: PlanCardProps) {
  return (
    <article className={`pricing-card ${highlight ? "pricing-card-highlight" : ""}`}>
      {highlight ? <span className="badge badge-accent">Популярный</span> : null}
      <h3>{title}</h3>
      <strong className="price-tag">{price}</strong>
      <p>{description}</p>
      <ul className="feature-list">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {ctaHref && ctaLabel ? (
        <Link className={`button ${highlight ? "button-primary" : "button-secondary"}`} href={ctaHref}>
          {ctaLabel}
        </Link>
      ) : null}
    </article>
  );
}
