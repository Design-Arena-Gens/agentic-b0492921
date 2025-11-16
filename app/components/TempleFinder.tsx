'use client';

import { useMemo, useState } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Sparkles,
  SlidersHorizontal,
  Filter,
  Sun
} from 'lucide-react';
import { temples, type Temple } from '../../lib/data/temples';
import TempleCard from './TempleCard';

type SortOption = 'relevance' | 'oldest' | 'newest' | 'significance';

const ALL_OPTION = 'All';

const regions = [
  ALL_OPTION,
  ...Array.from(new Set(temples.map((temple) => temple.region)))
];
const traditions = [
  ALL_OPTION,
  ...Array.from(new Set(temples.map((temple) => temple.tradition)))
];
const environments = [
  ALL_OPTION,
  ...Array.from(new Set(temples.map((temple) => temple.environment)))
];
const features = [
  ALL_OPTION,
  ...Array.from(
    temples
      .reduce<Set<string>>((acc, temple) => {
        temple.features.forEach((feature) => acc.add(feature));
        return acc;
      }, new Set<string>())
      .values()
  ).sort()
];

function scoreTemple(temple: Temple, normalizedSearch: string) {
  const base = temple.significanceScore;
  if (!normalizedSearch) {
    return base;
  }

  const haystacks = [
    temple.name,
    temple.city,
    temple.country,
    temple.description,
    temple.highlights.join(' '),
    temple.features.join(' ')
  ]
    .join(' ')
    .toLowerCase();

  if (!haystacks.includes(normalizedSearch)) {
    return base * 0.7;
  }

  const nameMatch = temple.name.toLowerCase().includes(normalizedSearch) ? 25 : 0;
  const cityMatch = temple.city.toLowerCase().includes(normalizedSearch) ? 15 : 0;
  const featureMatch = temple.features.some((feature) =>
    feature.toLowerCase().includes(normalizedSearch)
  )
    ? 10
    : 0;

  return base + nameMatch + cityMatch + featureMatch;
}

function matchesFilters(
  temple: Temple,
  options: {
    region: string;
    tradition: string;
    feature: string;
    environment: string;
  }
) {
  const regionMatch = options.region === ALL_OPTION || temple.region === options.region;
  const traditionMatch =
    options.tradition === ALL_OPTION || temple.tradition === options.tradition;
  const environmentMatch =
    options.environment === ALL_OPTION || temple.environment === options.environment;
  const featureMatch =
    options.feature === ALL_OPTION || temple.features.includes(options.feature);

  return regionMatch && traditionMatch && environmentMatch && featureMatch;
}

export default function TempleFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>(ALL_OPTION);
  const [selectedTradition, setSelectedTradition] = useState<string>(ALL_OPTION);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>(ALL_OPTION);
  const [selectedFeature, setSelectedFeature] = useState<string>(ALL_OPTION);
  const [sortOrder, setSortOrder] = useState<SortOption>('relevance');

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const rankedTemples = useMemo(() => {
    return temples
      .map((temple) => ({
        temple,
        score: scoreTemple(temple, normalizedSearch)
      }))
      .filter(({ temple }) =>
        matchesFilters(temple, {
          region: selectedRegion,
          tradition: selectedTradition,
          feature: selectedFeature,
          environment: selectedEnvironment
        })
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case 'oldest':
            return a.temple.founded - b.temple.founded;
          case 'newest':
            return b.temple.founded - a.temple.founded;
          case 'significance':
            return b.temple.significanceScore - a.temple.significanceScore;
          case 'relevance':
          default:
            return b.score - a.score;
        }
      });
  }, [
    normalizedSearch,
    selectedRegion,
    selectedTradition,
    selectedFeature,
    selectedEnvironment,
    sortOrder
  ]);

  const insights = useMemo(() => {
    const uniqueCountries = new Set(rankedTemples.map(({ temple }) => temple.country)).size;
    const topTraditions = rankedTemples
      .reduce<Record<string, number>>((acc, { temple }) => {
        acc[temple.tradition] = (acc[temple.tradition] ?? 0) + 1;
        return acc;
      }, {});

    const mostCommonTradition = Object.entries(topTraditions).sort((a, b) => b[1] - a[1])[0]?.[0];

    const averageFoundedYear =
      rankedTemples.reduce((acc, { temple }) => acc + temple.founded, 0) /
      Math.max(rankedTemples.length, 1);

    const standoutFeature =
      rankedTemples
        .flatMap(({ temple }) => temple.features)
        .reduce<Map<string, number>>((acc, feature) => {
          acc.set(feature, (acc.get(feature) ?? 0) + 1);
          return acc;
        }, new Map()) ?? new Map();

    const [featureName] = Array.from(standoutFeature.entries()).sort((a, b) => b[1] - a[1])[0] ?? [
      undefined
    ];

    return {
      uniqueCountries,
      mostCommonTradition,
      averageFoundedYear: Math.round(averageFoundedYear),
      standoutFeature: featureName
    };
  }, [rankedTemples]);

  const activeFilters = useMemo(() => {
    const filters: { label: string; value: string }[] = [];

    if (selectedRegion !== ALL_OPTION) {
      filters.push({ label: 'Region', value: selectedRegion });
    }
    if (selectedTradition !== ALL_OPTION) {
      filters.push({ label: 'Tradition', value: selectedTradition });
    }
    if (selectedEnvironment !== ALL_OPTION) {
      filters.push({ label: 'Environment', value: selectedEnvironment });
    }
    if (selectedFeature !== ALL_OPTION) {
      filters.push({ label: 'Highlight', value: selectedFeature });
    }

    return filters;
  }, [selectedRegion, selectedTradition, selectedEnvironment, selectedFeature]);

  const clearFilters = () => {
    setSelectedRegion(ALL_OPTION);
    setSelectedTradition(ALL_OPTION);
    setSelectedEnvironment(ALL_OPTION);
    setSelectedFeature(ALL_OPTION);
  };

  return (
    <div className="finder-shell">
      <section className="hero-card">
        <div className="hero-icon">
          <Compass strokeWidth={1.5} />
        </div>
        <div>
          <h1>Temple Discovery Companion</h1>
          <p>
            Explore significant temples across the globe. Filter by tradition, environment, or
            travel experience to plan mindful journeys and cultural fieldwork.
          </p>
        </div>
      </section>

      <section className="filters-card">
        <header>
          <div className="filters-title">
            <SlidersHorizontal strokeWidth={1.5} />
            <h2>Refine your journey</h2>
          </div>
          <button className="ghost-button" onClick={clearFilters} disabled={!activeFilters.length}>
            Reset filters
          </button>
        </header>

        <div className="filters-grid">
          <label className="input-label">
            <span>Search</span>
            <div className="input-field">
              <Search size={18} />
              <input
                placeholder="Search by name, city, or highlight"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label className="input-label">
            <span>Region</span>
            <div className="input-field select">
              <MapPin size={18} />
              <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="input-label">
            <span>Tradition</span>
            <div className="input-field select">
              <Sparkles size={18} />
              <select
                value={selectedTradition}
                onChange={(event) => setSelectedTradition(event.target.value)}
              >
                {traditions.map((tradition) => (
                  <option key={tradition} value={tradition}>
                    {tradition}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="input-label">
            <span>Environment</span>
            <div className="input-field select">
              <Sun size={18} />
              <select
                value={selectedEnvironment}
                onChange={(event) => setSelectedEnvironment(event.target.value)}
              >
                {environments.map((environment) => (
                  <option key={environment} value={environment}>
                    {environment}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="input-label">
            <span>Highlights</span>
            <div className="input-field select">
              <Filter size={18} />
              <select value={selectedFeature} onChange={(event) => setSelectedFeature(event.target.value)}>
                {features.map((feature) => (
                  <option key={feature} value={feature}>
                    {feature}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="input-label">
            <span>Sort by</span>
            <div className="input-field select">
              <Compass size={18} />
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOption)}>
                <option value="relevance">Relevance</option>
                <option value="significance">Significance</option>
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
              </select>
            </div>
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="active-tags">
            {activeFilters.map((filter) => (
              <span key={`${filter.label}-${filter.value}`} className="tag">
                {filter.label}: {filter.value}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="insights-grid">
        <article className="insight-card">
          <header>
            <MapPin size={18} />
            <span>Countries represented</span>
          </header>
          <strong>{insights.uniqueCountries}</strong>
        </article>
        <article className="insight-card">
          <header>
            <Sparkles size={18} />
            <span>Dominant tradition</span>
          </header>
          <strong>{insights.mostCommonTradition ?? '—'}</strong>
        </article>
        <article className="insight-card">
          <header>
            <SlidersHorizontal size={18} />
            <span>Average founding year</span>
          </header>
          <strong>{Number.isNaN(insights.averageFoundedYear) ? '—' : insights.averageFoundedYear}</strong>
        </article>
        <article className="insight-card">
          <header>
            <Filter size={18} />
            <span>Popular highlight</span>
          </header>
          <strong>{insights.standoutFeature ?? '—'}</strong>
        </article>
      </section>

      <section className="results-section">
        <header>
          <div>
            <h2>
              {rankedTemples.length} temple{rankedTemples.length === 1 ? '' : 's'} match your journey
            </h2>
            <p>
              Refine filters or explore the cards below for visiting tips, standout experiences, and
              planning resources.
            </p>
          </div>
        </header>

        <div className="cards-grid">
          {rankedTemples.map(({ temple, score }) => (
            <TempleCard key={temple.id} temple={temple} score={score} />
          ))}
        </div>
      </section>
    </div>
  );
}
