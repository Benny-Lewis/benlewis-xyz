import { useEffect, useMemo, useRef, useState } from 'react';

import { calculateAreaSqIn, calculatePricePerSqIn } from '@/lib/pizza';

type SortMode = 'best' | 'newest' | 'oldest';

type PizzaEntry = {
  id: string;
  createdAt: number;
  restaurant?: string;
  sizeLabel?: string;
  note?: string;
  price: number;
  diameterIn: number;
  slices?: number;
  areaSqIn: number;
  pricePerSqIn: number;
  pricePerSlice?: number;
};

type PizzaCalculatorProps = {
  headingFontClassName?: string;
};

const SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'XL'];

function getEntryIdentity(entry: PizzaEntry): string {
  if (entry.restaurant && entry.sizeLabel) {
    return `${entry.restaurant} - ${entry.sizeLabel}`;
  }

  if (entry.restaurant) {
    return entry.restaurant;
  }

  if (entry.sizeLabel) {
    return entry.sizeLabel;
  }

  return 'Unlabeled pizza';
}

export default function PizzaCalculator({ headingFontClassName }: PizzaCalculatorProps) {
  const [price, setPrice] = useState('');
  const [diameterIn, setDiameterIn] = useState('');
  const [slices, setSlices] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [sizePreset, setSizePreset] = useState('');
  const [customSizeLabel, setCustomSizeLabel] = useState('');
  const [customSizeDraft, setCustomSizeDraft] = useState('');
  const [isEditingCustomSize, setIsEditingCustomSize] = useState(false);
  const [note, setNote] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [entries, setEntries] = useState<PizzaEntry[]>([]);
  const [error, setError] = useState('');
  const [isFormActive, setIsFormActive] = useState(false);
  const customSizeInputRef = useRef<HTMLInputElement | null>(null);

  const sortedEntries = useMemo(() => {
    const items = [...entries];

    if (sortMode === 'best') {
      return items.sort((a, b) => a.pricePerSqIn - b.pricePerSqIn);
    }

    if (sortMode === 'newest') {
      return items.sort((a, b) => b.createdAt - a.createdAt);
    }

    return items.sort((a, b) => a.createdAt - b.createdAt);
  }, [entries, sortMode]);

  const valueRankById = useMemo(() => {
    const ranked = [...entries].sort((a, b) => {
      if (a.pricePerSqIn !== b.pricePerSqIn) {
        return a.pricePerSqIn - b.pricePerSqIn;
      }

      return a.createdAt - b.createdAt;
    });

    return new Map(ranked.map((entry, index) => [entry.id, index + 1]));
  }, [entries]);

  const bestValueEntryId = useMemo(() => {
    if (entries.length === 0) {
      return undefined;
    }

    return entries.reduce((bestEntry, entry) =>
      entry.pricePerSqIn < bestEntry.pricePerSqIn ? entry : bestEntry
    ).id;
  }, [entries]);

  useEffect(() => {
    if (isEditingCustomSize) {
      customSizeInputRef.current?.focus();
      customSizeInputRef.current?.select();
    }
  }, [isEditingCustomSize]);

  function beginCustomSizeInput(initialValue = '') {
    setSizePreset('');
    setCustomSizeDraft(initialValue);
    setIsEditingCustomSize(true);
  }

  function commitCustomSize() {
    const nextValue = customSizeDraft.trim();
    setIsEditingCustomSize(false);

    if (nextValue.length === 0) {
      setCustomSizeLabel('');
      setCustomSizeDraft('');
      return;
    }

    setCustomSizeLabel(nextValue);
    setCustomSizeDraft(nextValue);
    setSizePreset('');
  }

  function handleAddPizza(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number.parseFloat(price);
    const parsedDiameter = Number.parseFloat(diameterIn);
    const normalizedSlices = slices.trim();
    const parsedSlicesValue = normalizedSlices === '' ? undefined : Number(normalizedSlices);
    const parsedSlices = normalizedSlices === '' ? undefined : parsedSlicesValue;
    const normalizedCustomSize = customSizeLabel.trim();

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Enter a valid price greater than 0.');
      return;
    }

    if (!Number.isFinite(parsedDiameter) || parsedDiameter <= 0) {
      setError('Enter a valid diameter greater than 0.');
      return;
    }

    if (
      normalizedSlices !== '' &&
      (!/^\d+$/.test(normalizedSlices) ||
        parsedSlicesValue === undefined ||
        !Number.isInteger(parsedSlicesValue) ||
        parsedSlicesValue <= 0)
    ) {
      setError('Enter a valid whole number of slices greater than 0.');
      return;
    }

    const areaSqIn = calculateAreaSqIn(parsedDiameter);
    const pricePerSqIn = calculatePricePerSqIn(parsedPrice, parsedDiameter);
    const pricePerSlice = parsedSlices ? parsedPrice / parsedSlices : undefined;

    const entry: PizzaEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      restaurant: restaurant.trim() || undefined,
      sizeLabel: normalizedCustomSize || sizePreset || undefined,
      note: note.trim() || undefined,
      price: parsedPrice,
      diameterIn: parsedDiameter,
      slices: parsedSlices,
      areaSqIn,
      pricePerSqIn,
      pricePerSlice,
    };

    setEntries((current) => [...current, entry]);
    setError('');
    setPrice('');
    setDiameterIn('');
    setSlices('');
    setRestaurant('');
    setSizePreset('');
    setCustomSizeLabel('');
    setCustomSizeDraft('');
    setIsEditingCustomSize(false);
    setNote('');
  }

  function handleRemove(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleFormBlur(event: React.FocusEvent<HTMLFormElement>) {
    const nextFocusedElement = event.relatedTarget as Node | null;
    if (nextFocusedElement && event.currentTarget.contains(nextFocusedElement)) {
      return;
    }

    setIsFormActive(false);
  }

  return (
    <section
      className="calculator-panel mt-12 max-w-2xl space-y-5 rounded-xl border p-5"
      aria-label="Pizza value calculator"
    >
      <div className="space-y-2">
        <h2 className={`${headingFontClassName ?? ''} text-2xl`}>Pizza value calculator</h2>
        <p style={{ color: 'var(--color-text)', opacity: 0.82 }}>
          Enter a pizza and compare value by cents per square inch.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={handleAddPizza}
        onFocusCapture={() => setIsFormActive(true)}
        onBlurCapture={handleFormBlur}
      >
        <div className="grid gap-3 sm:grid-cols-[8rem_9rem_6rem] sm:items-start">
          <label className="space-y-2 text-sm">
            <span className="block leading-none">
              Price (USD) <span style={{ color: 'var(--color-primary)' }}>*</span>
            </span>
            <div className="relative">
              <span
                className="pointer-events-none absolute inset-y-0 left-2 inline-flex items-center text-sm"
                style={{ color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="18.99"
                className="calculator-field focus-accent w-full rounded-sm border py-2 pl-6 pr-3 outline-none"
                required
              />
            </div>
          </label>

          <label className="space-y-2 text-sm">
            <span className="block leading-none">
              Diameter (inches) <span style={{ color: 'var(--color-primary)' }}>*</span>
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={diameterIn}
                onChange={(event) => setDiameterIn(event.target.value)}
                placeholder="14"
                className="calculator-field focus-accent w-full rounded-sm border px-3 py-2 pr-9 outline-none"
                required
              />
              <span
                className="pointer-events-none absolute inset-y-0 right-2 inline-flex items-center text-sm"
                style={{ color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                in
              </span>
            </div>
          </label>

          <label className="space-y-2 text-sm">
            <span className="block leading-none">Slices</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={slices}
              onChange={(event) => setSlices(event.target.value)}
              className="calculator-field focus-accent w-full rounded-sm border px-3 py-2 outline-none"
            />
            <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Optional (enables $/slice)
            </span>
          </label>
        </div>

        <div>
          <label className="block w-full space-y-2 text-sm sm:max-w-sm">
            <span className="block leading-none">Restaurant</span>
            <input
              type="text"
              value={restaurant}
              onChange={(event) => setRestaurant(event.target.value)}
              placeholder="Tony's Pizza"
              className="calculator-field focus-accent w-full rounded-sm border px-3 py-2 outline-none"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
          <div className="space-y-2 text-sm">
            <p className="leading-none">Menu size label</p>
            <div className="flex w-full max-w-sm flex-wrap gap-2">
              {SIZE_OPTIONS.map((option) => {
                const selected = sizePreset === option;

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setCustomSizeLabel('');
                      setCustomSizeDraft('');
                      setIsEditingCustomSize(false);
                      setSizePreset((current) => (current === option ? '' : option));
                    }}
                    className={`size-option focus-accent rounded-full border px-3 py-1.5 text-sm ${
                      selected ? 'size-option-selected font-medium' : ''
                    }`}
                  >
                    {option}
                  </button>
                );
              })}

              {isEditingCustomSize ? (
                <div
                  className="size-option size-option-selected size-option-custom-input focus-accent inline-flex h-[2.125rem] items-center rounded-full border px-3"
                >
                  <input
                    ref={customSizeInputRef}
                    type="text"
                    value={customSizeDraft}
                    onChange={(event) => setCustomSizeDraft(event.target.value)}
                    onBlur={commitCustomSize}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitCustomSize();
                      }
                    }}
                    placeholder="Custom"
                    className="focus-accent w-24 rounded-sm bg-transparent text-sm outline-none"
                    aria-label="Custom menu size label"
                  />
                </div>
              ) : customSizeLabel ? (
                <span
                  className="size-option size-option-selected inline-flex h-[2.125rem] items-center gap-2 rounded-full border px-3 text-sm font-medium"
                >
                  <button
                    type="button"
                    className="focus-accent rounded-sm px-0.5 leading-none"
                    onClick={() => beginCustomSizeInput(customSizeLabel)}
                    aria-label={`Edit custom size ${customSizeLabel}`}
                  >
                    {customSizeLabel}
                  </button>
                  <button
                    type="button"
                    className="focus-accent inline-flex items-center justify-center rounded-sm transition-opacity hover:opacity-70"
                    onClick={() => {
                      setCustomSizeLabel('');
                      setCustomSizeDraft('');
                      setSizePreset('');
                    }}
                    aria-label="Clear custom size"
                    title="Clear custom size"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => beginCustomSizeInput('')}
                  className="size-option focus-accent rounded-full border px-3 py-1.5 text-sm"
                  aria-label="Add custom size"
                >
                  + Custom
                </button>
              )}
            </div>

            {error ? (
              <p className="message-warm rounded-sm px-3 py-2 text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-add focus-accent rounded-sm border px-4 py-2 text-sm font-medium"
            >
              Add to results
            </button>
          </div>

          <div className="w-full space-y-2 text-sm sm:max-w-sm">
            <p className="leading-none">Notes</p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Thin crust"
              rows={2}
              className="calculator-field notes-field focus-accent w-full rounded-sm border px-3 py-2 outline-none"
            />
          </div>
        </div>
      </form>

      <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between gap-4">
          <h3 className={`${headingFontClassName ?? ''} results-heading text-lg`}>Results</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center text-sm">
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="calculator-field focus-accent rounded-sm border px-2 py-1"
                aria-label="Sort results"
              >
                <option value="best">Best value</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setEntries([]);
              }}
              className="btn-clear focus-accent rounded-sm border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={entries.length === 0}
            >
              Clear all
            </button>
          </div>
        </div>

        {sortedEntries.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No pizzas added yet.
          </p>
        ) : (
          <table className="results-table w-full table-fixed border-y text-sm">
            <thead>
              <tr>
                <th className="w-10 px-2 py-2 text-left font-normal">Rank</th>
                <th className="w-28 px-2 py-2 text-left font-normal">Value (&cent;/in<sup>2</sup>)</th>
                <th className="w-36 px-2 py-2 text-left font-normal">Pizza</th>
                <th className="w-20 px-2 py-2 text-left font-normal">$/slice</th>
                <th className="px-2 py-2 text-left font-normal">Details</th>
                <th className="w-8 px-1 py-2 text-right font-normal" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => {
                const isBestValue = entry.id === bestValueEntryId;

                return (
                  <tr
                    key={entry.id}
                    className={`results-row border-t align-top ${isBestValue ? 'best-value-row' : ''} ${
                      isBestValue && isFormActive ? 'best-value-row-muted' : ''
                    }`}
                  >
                    <td className="px-2 py-3 tabular-nums">{valueRankById.get(entry.id) ?? index + 1}</td>
                    <td className="px-2 py-3 tabular-nums align-top">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`value-pill inline-block rounded-sm px-2 py-0 text-base leading-tight align-top ${
                            isBestValue ? 'value-pill-best font-semibold' : 'font-medium'
                          }`}
                        >
                          {(entry.pricePerSqIn * 100).toFixed(2)} &cent;/in<sup>2</sup>
                        </span>
                        {isBestValue ? (
                          <span className="best-value-badge inline-block rounded-sm px-2 py-0.5 text-[11px] font-medium">
                            Best value
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="font-medium">{getEntryIdentity(entry)}</div>
                    </td>
                    <td className="px-2 py-3 tabular-nums">
                      {typeof entry.pricePerSlice === 'number' ? (
                        `$${entry.pricePerSlice.toFixed(2)}`
                      ) : (
                        <span className="results-muted">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm tabular-nums">
                        <span className="whitespace-nowrap">
                          Price: <strong>${entry.price.toFixed(2)}</strong>
                        </span>
                        <span className="results-separator" aria-hidden="true">
                          •
                        </span>
                        <span className="whitespace-nowrap">
                          Dia: <strong>{entry.diameterIn.toFixed(1)}&quot;</strong>
                        </span>
                        {typeof entry.slices === 'number' ? (
                          <>
                            <span className="results-separator" aria-hidden="true">
                              •
                            </span>
                            <span className="whitespace-nowrap">
                              Slices: <strong>{entry.slices}</strong>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="results-separator" aria-hidden="true">
                              •
                            </span>
                            <span className="results-muted whitespace-nowrap">Slices: —</span>
                          </>
                        )}
                      </div>
                      {entry.note ? (
                        <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          Notes: {entry.note}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-1 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(entry.id)}
                        className="icon-muted focus-accent rounded-sm p-2 text-sm"
                        aria-label={`Remove result ${index + 1}`}
                        title="Remove"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 10v7" />
                          <path d="M14 10v7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}


