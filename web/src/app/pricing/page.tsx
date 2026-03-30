import { PlanCard } from "@/components/plan-card";
import { pricingCards } from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="page-stack">
      <section className="section">
        <div className="container section-heading">
          <span className="eyebrow">Pricing</span>
          <h1>Тарифы для ZIP sharing SaaS</h1>
          <p>Free, разовые доплаты и подписки для постоянной публикации плейлистов.</p>
        </div>
      </section>

      <section className="section">
        <div className="container card-grid four">
          {pricingCards.map((card) => (
            <PlanCard
              key={card.key}
              ctaHref={card.key === "PAYG" ? "/dashboard" : "/register"}
              ctaLabel={card.key === "PAYG" ? "Использовать в upload" : "Выбрать тариф"}
              description={card.description}
              features={card.features}
              highlight={card.highlight}
              price={card.price}
              title={card.title}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
