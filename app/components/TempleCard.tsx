import { MapPin, Compass } from 'lucide-react';
import type { Temple } from '../../lib/data/temples';

type TempleCardProps = {
  temple: Temple;
  score: number;
};

export default function TempleCard({ temple, score }: TempleCardProps) {
  return (
    <article className="temple-card">
      <header>
        <div>
          <h3>{temple.name}</h3>
          <p className="location">
            <MapPin size={16} />
            <span>
              {temple.city}, {temple.country}
            </span>
          </p>
        </div>
        <div className="score-badge" aria-label="Relevance score">
          <Compass size={14} />
          <span>{Math.round(score)}</span>
        </div>
      </header>

      <p className="description">{temple.description}</p>

      <dl className="meta">
        <div>
          <dt>Tradition</dt>
          <dd>{temple.tradition}</dd>
        </div>
        <div>
          <dt>Founded</dt>
          <dd>{temple.founded}</dd>
        </div>
        <div>
          <dt>Environment</dt>
          <dd>{temple.environment}</dd>
        </div>
        <div>
          <dt>Best for</dt>
          <dd>{temple.bestVisit}</dd>
        </div>
      </dl>

      <section className="feature-section">
        <h4>Highlights</h4>
        <ul>
          {temple.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>

      <section className="feature-section">
        <h4>Experiences</h4>
        <div className="pill-list">
          {temple.features.map((feature) => (
            <span key={feature} className="pill">
              {feature}
            </span>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <small>Visiting hours</small>
          <strong>{temple.visitingHours}</strong>
        </div>
        {temple.website && (
          <a href={temple.website} target="_blank" rel="noreferrer">
            Official site
          </a>
        )}
      </footer>
    </article>
  );
}
