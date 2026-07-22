import React, { useEffect, useMemo, useState } from "react";
import {
  calculateQuote,
  deleteSupplement,
  fetchSupplementPdf,
  getAdminPricing,
  getConfig,
  getSampleQuote,
  getSupplements,
  resetAdminPricing,
  saveQuote,
  updateAdminPricing,
  uploadSupplements
} from "./api.js";
import { normalizeDoorRowHeight, paginateIndivisibleRows } from "./invoiceLayout.js";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const preciseCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const today = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric"
}).format(new Date());

const ADD_ON_DRIVERS = ["SF", "Glass", "Slabs", "Each"];
const SPECIAL_REFERENCE_LISTS = new Set(["Styles"]);

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function unique(values) {
  const seen = new Set();
  const output = [];
  for (const value of values || []) {
    if (value === undefined || value === null || value === "") continue;
    const key = String(value).trim();
    if (!key || seen.has(key.toLowerCase())) continue;
    seen.add(key.toLowerCase());
    output.push(value);
  }
  return output;
}

function normalizeReferenceValue(listName, value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  if (listName === "Slabs") {
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : trimmed;
  }
  return trimmed;
}

function blankUnit(id) {
  return {
    id,
    name: "",
    style: "",
    buildType: "",
    slabs: "",
    heightIn: "",
    widthIn: "",
    glassSf: "",
    quantity: "",
    swing: "",
    accessibility: "",
    color: "",
    glassTexture: "",
    glassColor: "",
    discountOverride: "",
    addOns: {}
  };
}

function updateUnit(quote, unitId, patch) {
  return {
    ...quote,
    units: quote.units.map((unit) =>
      unit.id === unitId ? { ...unit, ...patch } : unit
    )
  };
}

function toggleAddOn(quote, unitId, addOnName) {
  return {
    ...quote,
    units: quote.units.map((unit) => {
      if (unit.id !== unitId) return unit;
      return {
        ...unit,
        addOns: {
          ...(unit.addOns || {}),
          [addOnName]: !unit.addOns?.[addOnName]
        }
      };
    })
  };
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function formatSelectOptionLabel(label, option) {
  if (label === "Door Type") {
    const n = Number(option);
    if (n === 1) return "Single Door";
    if (n === 2) return "Double Door";
    if (Number.isFinite(n) && n > 0) return `${n}-Door Unit`;
  }
  return option;
}

function SelectField({ label, value, options, onChange }) {
  return (
    <Field label={label}>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options?.map((option) => (
          <option value={option} key={String(option)}>
            {formatSelectOptionLabel(label, option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function NumberField({ label, value, min = 0, step = "any", onChange }) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        step={step}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    </Field>
  );
}


function unitTotalSf(unit) {
  const override = Number(unit.totalSf || 0);
  if (override > 0) return override;

  const heightIn = Number(unit.heightIn || 0);
  const widthIn = Number(unit.widthIn || 0);
  if (heightIn > 0 && widthIn > 0) return (heightIn * widthIn) / 144;

  // Backward compatibility for older saved quotes that used feet.
  const heightFt = Number(unit.heightFt || 0);
  const widthFt = Number(unit.widthFt || 0);
  if (heightFt > 0 && widthFt > 0) return heightFt * widthFt;

  return 0;
}

function QuoteHeader({ quote, setQuote, config }) {
  return (
    <section className="card setup-card">
      <div className="section-header">
        <div>
          <h2>Quote setup</h2>
          <p className="muted">Customer type and tier drive the default material discount.</p>
        </div>
      </div>

      <div className="setup-layout">
        <div>
          <h3>Client</h3>
          <div className="grid two compact-grid">
            <Field label="Company / Project">
              <input
                value={quote.preparedFor?.company || ""}
                onChange={(e) =>
                  setQuote({
                    ...quote,
                    preparedFor: { ...quote.preparedFor, company: e.target.value }
                  })
                }
              />
            </Field>
            <Field label="Contact">
              <input
                value={quote.preparedFor?.contact || ""}
                onChange={(e) =>
                  setQuote({
                    ...quote,
                    preparedFor: { ...quote.preparedFor, contact: e.target.value }
                  })
                }
              />
            </Field>
          </div>
        </div>

        <div>
          <h3>Prestige</h3>
          <div className="grid two compact-grid">
            <Field label="Quote #">
              <input
                value={quote.quoteNumber || ""}
                onChange={(e) => setQuote({ ...quote, quoteNumber: e.target.value })}
              />
            </Field>
            <Field label="Salesperson">
              <input
                value={quote.preparedBy?.name || ""}
                onChange={(e) =>
                  setQuote({
                    ...quote,
                    preparedBy: { ...quote.preparedBy, name: e.target.value }
                  })
                }
              />
            </Field>
            <Field label="Salesperson Email">
              <input
                value={quote.preparedBy?.email || ""}
                onChange={(e) =>
                  setQuote({
                    ...quote,
                    preparedBy: { ...quote.preparedBy, email: e.target.value }
                  })
                }
              />
            </Field>
            <Field label="Salesperson Phone">
              <input
                value={quote.preparedBy?.phone || ""}
                onChange={(e) =>
                  setQuote({
                    ...quote,
                    preparedBy: { ...quote.preparedBy, phone: e.target.value }
                  })
                }
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid four compact-grid">
        <SelectField
          label="Customer Type"
          value={quote.customerType}
          options={config?.referenceLists?.["Customer Type"]}
          onChange={(customerType) => setQuote({ ...quote, customerType })}
        />
        <SelectField
          label="Discount Tier"
          value={quote.discountTier}
          options={config?.referenceLists?.["Discount Tier"]}
          onChange={(discountTier) => setQuote({ ...quote, discountTier })}
        />
        <NumberField
          label="Install Discount %"
          value={(quote.installationDiscountRate ?? 0) * 100}
          step="1"
          onChange={(value) =>
            setQuote({
              ...quote,
              installationDiscountRate: Number(value || 0) / 100
            })
          }
        />
        <NumberField
          label="Production Deposit %"
          value={(quote.productionDepositRate ?? 0.5) * 100}
          step="1"
          onChange={(value) =>
            setQuote({
              ...quote,
              productionDepositRate: Number(value || 0) / 100
            })
          }
        />
      </div>
    </section>
  );
}

function UnitEditor({ unit, quote, setQuote, config }) {
  const totalSf = unitTotalSf(unit);
  const availableAddOns = config?.addOns || [];

  return (
    <section className="card unit-card">
      <div className="unit-title">
        <h3>{unit.name || `Unit ${unit.id}`}</h3>
        <button
          type="button"
          className="danger secondary"
          onClick={() =>
            setQuote({
              ...quote,
              units: quote.units.filter((candidate) => candidate.id !== unit.id)
            })
          }
        >
          Remove
        </button>
      </div>

      <div className="grid four">
        <Field label="Unit Name">
          <input
            value={unit.name || ""}
            onChange={(e) =>
              setQuote(updateUnit(quote, unit.id, { name: e.target.value }))
            }
          />
        </Field>
        <SelectField
          label="Style"
          value={unit.style}
          options={config?.referenceLists?.Styles?.filter((item) => item !== "[TBD]")}
          onChange={(style) => setQuote(updateUnit(quote, unit.id, { style }))}
        />
        <SelectField
          label="Build Type"
          value={unit.buildType}
          options={config?.referenceLists?.["Build Types"]}
          onChange={(buildType) =>
            setQuote(updateUnit(quote, unit.id, { buildType }))
          }
        />
        <NumberField
          label="Quantity"
          value={unit.quantity}
          step="1"
          onChange={(quantity) =>
            setQuote(updateUnit(quote, unit.id, { quantity }))
          }
        />
        <NumberField
          label="Height (in)"
          value={unit.heightIn}
          step="1"
          onChange={(heightIn) =>
            setQuote(updateUnit(quote, unit.id, { heightIn }))
          }
        />
        <NumberField
          label="Width (in)"
          value={unit.widthIn}
          step="1"
          onChange={(widthIn) =>
            setQuote(updateUnit(quote, unit.id, { widthIn }))
          }
        />
        <NumberField
          label="Total SF override"
          value={unit.totalSf || ""}
          onChange={(totalSf) =>
            setQuote(updateUnit(quote, unit.id, { totalSf }))
          }
        />
        <NumberField
          label="Glass Area SF"
          value={unit.glassSf}
          onChange={(glassSf) =>
            setQuote(updateUnit(quote, unit.id, { glassSf }))
          }
        />
        <SelectField
          label="Door Type"
          value={unit.slabs}
          options={config?.referenceLists?.Slabs || [1, 2]}
          onChange={(slabs) => setQuote(updateUnit(quote, unit.id, { slabs: Number(slabs) || slabs }))}
        />
        <SelectField
          label="Swing"
          value={unit.swing}
          options={config?.referenceLists?.Swing}
          onChange={(swing) => setQuote(updateUnit(quote, unit.id, { swing }))}
        />
        <SelectField
          label="Color"
          value={unit.color}
          options={config?.referenceLists?.Colors}
          onChange={(color) => setQuote(updateUnit(quote, unit.id, { color }))}
        />
        <SelectField
          label="Glass Texture"
          value={unit.glassTexture}
          options={config?.referenceLists?.["Glass Type"]}
          onChange={(glassTexture) =>
            setQuote(updateUnit(quote, unit.id, { glassTexture }))
          }
        />
        <SelectField
          label="Glass Color"
          value={unit.glassColor}
          options={config?.referenceLists?.["Glass Color"]}
          onChange={(glassColor) =>
            setQuote(updateUnit(quote, unit.id, { glassColor }))
          }
        />
        <SelectField
          label="Accessibility"
          value={unit.accessibility}
          options={config?.referenceLists?.Accessibility}
          onChange={(accessibility) =>
            setQuote(updateUnit(quote, unit.id, { accessibility }))
          }
        />
        <Field label="Unit Discount Override">
          <input
            placeholder="blank = default"
            value={
              unit.discountOverride === undefined || unit.discountOverride === null
                ? ""
                : unit.discountOverride
            }
            onChange={(e) => {
              const raw = e.target.value;
              const normalized =
                raw === "" ? "" : Number(raw) > 1 ? Number(raw) / 100 : Number(raw);
              setQuote(updateUnit(quote, unit.id, { discountOverride: normalized }));
            }}
          />
        </Field>
      </div>

      <p className="small muted">
        Calculated total SF: {totalSf.toFixed(2)}. Width and height are entered in inches; pricing converts them to SF behind the scenes. Add-ons are priced by their driver: SF, glass SF, door type, or each.
      </p>

      <div className="addon-grid">
        {availableAddOns.map((addOn) => (
          <label className="checkbox" key={addOn.name}>
            <input
              type="checkbox"
              checked={Boolean(unit.addOns?.[addOn.name])}
              onChange={() => setQuote(toggleAddOn(quote, unit.id, addOn.name))}
            />
            <span>{addOn.name}</span>
            <em>{addOn.driver}</em>
          </label>
        ))}
      </div>
    </section>
  );
}

function PricingGuide({ config }) {
  const publicPricing = config?.publicPricing;
  const styleNames = Object.keys(publicPricing?.styles || {});
  const [selectedStyle, setSelectedStyle] = useState(styleNames[0] || "Traditional");

  useEffect(() => {
    if (!styleNames.includes(selectedStyle) && styleNames[0]) {
      setSelectedStyle(styleNames[0]);
    }
  }, [selectedStyle, styleNames.join("|")]);

  if (!publicPricing) return null;

  return (
    <section className="card pricing-guide">
      <div className="section-header">
        <div>
          <h2>Prestige price guide</h2>
          <p className="muted">
            Quick reference for the current sell-side prices used by the quote engine.
          </p>
        </div>
        <label className="inline-control">
          View add-on prices for
          <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
            {styleNames.map((style) => (
              <option value={style} key={style}>{style}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Style</th>
              <th>Prestige Price / SF</th>
            </tr>
          </thead>
          <tbody>
            {styleNames.map((style) => (
              <tr key={style}>
                <td>{style}</td>
                <td>{preciseCurrency.format(publicPricing.styles[style].pricePerSf)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="pricing-details">
        <summary>Add-on Prestige prices for {selectedStyle}</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Add-on</th>
                <th>Driver</th>
                <th>Prestige Price</th>
              </tr>
            </thead>
            <tbody>
              {publicPricing.addOns.map((addOn) => (
                <tr key={addOn.name}>
                  <td>{addOn.name}</td>
                  <td>{addOn.units || addOn.driver}</td>
                  <td>{preciseCurrency.format(addOn.prices?.[selectedStyle] || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function PricingAdminPanel({ onPricingSaved, setStatus }) {
  const [pricing, setPricing] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newStyle, setNewStyle] = useState({ name: "", pricePerSf: 0 });
  const [newAddOn, setNewAddOn] = useState({ name: "", driver: "SF", units: "/ SF" });
  const [newReferenceOptions, setNewReferenceOptions] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadPricing() {
      try {
        const data = await getAdminPricing();
        if (!cancelled) {
          setPricing(data);
          setLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          setPricing(null);
          setLoadError(error.message);
        }
      }
    }

    loadPricing();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!pricing) {
    return (
      <section className="card">
        <h2>Pricing & options editor</h2>
        <p>{loadError || "Loading pricing controls…"}</p>
      </section>
    );
  }

  const styleNames = Object.keys(pricing.styles || {});
  const customerTypes = pricing.referenceLists?.["Customer Type"] || Object.keys(pricing.discounts || {});
  const discountTiers = pricing.referenceLists?.["Discount Tier"] || ["Low", "High"];
  const buildTypes = pricing.referenceLists?.["Build Types"] || [];
  const editableReferenceLists = Object.keys(pricing.referenceLists || {}).filter(
    (listName) => !SPECIAL_REFERENCE_LISTS.has(listName)
  );

  function syncDependentTables(next) {
    next.referenceLists = next.referenceLists || {};
    next.styles = next.styles || {};
    next.addOns = next.addOns || [];
    next.discounts = next.discounts || {};
    next.install = next.install || {};

    const currentStyleNames = Object.keys(next.styles);
    next.referenceLists.Styles = unique([
      ...currentStyleNames,
      ...(next.referenceLists.Styles || []).filter((item) => item !== "[TBD]")
    ]);

    for (const styleName of currentStyleNames) {
      const style = next.styles[styleName] || {};
      next.styles[styleName] = {
        pricePerSf: round2(Number(style.pricePerSf || 0))
      };
    }

    next.addOns = next.addOns.map((addOn) => {
      const prices = {};
      for (const styleName of currentStyleNames) {
        prices[styleName] = round2(Number(addOn.prices?.[styleName] || 0));
      }
      return {
        name: String(addOn.name || "Untitled Add-on").trim(),
        driver: ADD_ON_DRIVERS.includes(addOn.driver) ? addOn.driver : "SF",
        units: addOn.units || addOn.driver || "SF",
        prices
      };
    });

    const types = next.referenceLists["Customer Type"] || [];
    const tiers = next.referenceLists["Discount Tier"] || [];
    for (const customerType of types) {
      next.discounts[customerType] = next.discounts[customerType] || {};
      for (const tier of tiers) {
        next.discounts[customerType][tier] = Number(next.discounts[customerType]?.[tier] || 0);
      }
    }

    for (const buildType of next.referenceLists["Build Types"] || []) {
      next.install[buildType] = Number(next.install[buildType] || 0);
    }

    return next;
  }

  function mutatePricing(mutator) {
    setPricing((current) => {
      const next = structuredClone(current);
      mutator(next);
      return syncDependentTables(next);
    });
  }

  function updateStylePrice(styleName, rawValue) {
    mutatePricing((next) => {
      next.styles[styleName].pricePerSf = Number(rawValue || 0);
    });
  }

  function addStyle() {
    const name = String(newStyle.name || "").trim();
    if (!name) {
      setStatus("Enter a style name first.");
      return;
    }
    if (pricing.styles?.[name]) {
      setStatus(`Style already exists: ${name}`);
      return;
    }

    mutatePricing((next) => {
      next.styles[name] = {
        pricePerSf: round2(Number(newStyle.pricePerSf || 0))
      };
      next.referenceLists.Styles = unique([...(next.referenceLists.Styles || []), name]);
      for (const addOn of next.addOns || []) {
        addOn.prices = addOn.prices || {};
        addOn.prices[name] = 0;
      }
    });

    setNewStyle({ name: "", pricePerSf: 0 });
    setStatus(`Added style: ${name}. Click Save Pricing to keep it in this browser.`);
  }

  function removeStyle(styleName) {
    if (styleNames.length <= 1) {
      setStatus("You need at least one style.");
      return;
    }
    mutatePricing((next) => {
      delete next.styles[styleName];
      next.referenceLists.Styles = (next.referenceLists.Styles || []).filter((item) => item !== styleName);
      for (const addOn of next.addOns || []) {
        delete addOn.prices?.[styleName];
      }
    });
  }

  function updateAddOnField(index, field, rawValue) {
    mutatePricing((next) => {
      next.addOns[index][field] = rawValue;
    });
  }

  function updateAddOnPrice(index, styleName, rawValue) {
    mutatePricing((next) => {
      next.addOns[index].prices[styleName] = Number(rawValue || 0);
    });
  }

  function addAddOn() {
    const name = String(newAddOn.name || "").trim();
    if (!name) {
      setStatus("Enter an add-on name first.");
      return;
    }
    if ((pricing.addOns || []).some((addOn) => addOn.name.toLowerCase() === name.toLowerCase())) {
      setStatus(`Add-on already exists: ${name}`);
      return;
    }

    mutatePricing((next) => {
      const prices = {};
      for (const styleName of Object.keys(next.styles || {})) {
        prices[styleName] = 0;
      }
      next.addOns.push({
        name,
        driver: newAddOn.driver || "SF",
        units: newAddOn.units || newAddOn.driver || "SF",
        prices
      });
    });

    setNewAddOn({ name: "", driver: "SF", units: "/ SF" });
    setStatus(`Added add-on: ${name}. Click Save Pricing to keep it in this browser.`);
  }

  function removeAddOn(index) {
    mutatePricing((next) => {
      next.addOns.splice(index, 1);
    });
  }

  function addReferenceOption(listName) {
    const value = normalizeReferenceValue(listName, newReferenceOptions[listName]);
    if (value === "") {
      setStatus(`Enter a ${listName} option first.`);
      return;
    }

    mutatePricing((next) => {
      const list = next.referenceLists[listName] || [];
      const exists = list.some((item) => String(item).trim().toLowerCase() === String(value).trim().toLowerCase());
      if (!exists) next.referenceLists[listName] = [...list, value];
    });

    setNewReferenceOptions((current) => ({ ...current, [listName]: "" }));
    setStatus(`Added ${listName} option: ${value}. Click Save Pricing to keep it in this browser.`);
  }

  function removeReferenceOption(listName, value) {
    mutatePricing((next) => {
      next.referenceLists[listName] = (next.referenceLists[listName] || []).filter(
        (item) => String(item) !== String(value)
      );
    });
  }

  function updateInstallPrice(buildType, rawValue) {
    mutatePricing((next) => {
      next.install[buildType] = Number(rawValue || 0);
    });
  }

  function updateDiscount(customerType, tier, rawValue) {
    mutatePricing((next) => {
      next.discounts[customerType] = next.discounts[customerType] || {};
      next.discounts[customerType][tier] = Number(rawValue || 0) / 100;
    });
  }

  async function savePricingChanges() {
    setSaving(true);
    try {
      const saved = await updateAdminPricing(pricing);
      setPricing(saved);
      const publicConfig = await getConfig();
      onPricingSaved(publicConfig);
      setStatus("Saved in this browser. Pricing, styles, add-ons, discounts, install rules, and dropdowns are now active on this device.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function resetPricingChanges() {
    setSaving(true);
    try {
      const reset = await resetAdminPricing();
      setPricing(reset);
      const publicConfig = await getConfig();
      onPricingSaved(publicConfig);
      setStatus("Pricing on this device reset to the original workbook values.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="pricing-controls" className="card internal pricing-admin">
      <div className="section-header">
        <div>
          <h2>Pricing & options editor</h2>
          <p className="muted">
            Update selling prices, add-on names, dropdown options, discounts, and installation pricing. Changes save in this browser and remain available after Render sleeps or redeploys.
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="secondary" onClick={resetPricingChanges} disabled={saving}>
            Reset Pricing
          </button>
          <button type="button" onClick={savePricingChanges} disabled={saving}>
            {saving ? "Saving…" : "Save Pricing"}
          </button>
        </div>
      </div>

      <h3>Base style pricing</h3>
      <div className="add-row">
        <Field label="New Style Name">
          <input value={newStyle.name} onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })} />
        </Field>
        <Field label="Selling Price / SF">
          <input type="number" step="0.01" value={newStyle.pricePerSf} onChange={(e) => setNewStyle({ ...newStyle, pricePerSf: e.target.value })} />
        </Field>
        <button type="button" onClick={addStyle}>Add Style</button>
      </div>

      <div className="table-wrap">
        <table className="editable-table">
          <thead>
            <tr>
              <th>Style</th>
              <th>Selling Price / SF</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {styleNames.map((styleName) => {
              const style = pricing.styles[styleName];
              return (
                <tr key={styleName}>
                  <td>{styleName}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={style.pricePerSf ?? 0}
                      onChange={(e) => updateStylePrice(styleName, e.target.value)}
                    />
                  </td>
                  <td>
                    <button type="button" className="danger secondary small-button" onClick={() => removeStyle(styleName)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3>Add-on pricing</h3>
      <p className="small muted">
        Add-ons become checkboxes in the unit editor. Rename them or edit the selling price for each door style.
      </p>
      <div className="add-row">
        <Field label="New Add-on Name">
          <input value={newAddOn.name} onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })} />
        </Field>
        <Field label="Driver">
          <select value={newAddOn.driver} onChange={(e) => setNewAddOn({ ...newAddOn, driver: e.target.value })}>
            {ADD_ON_DRIVERS.map((driver) => <option key={driver} value={driver}>{driver}</option>)}
          </select>
        </Field>
        <Field label="Units Label">
          <input value={newAddOn.units} onChange={(e) => setNewAddOn({ ...newAddOn, units: e.target.value })} />
        </Field>
        <button type="button" onClick={addAddOn}>Add Add-on</button>
      </div>

      <div className="table-wrap tall-table">
        <table className="editable-table compact">
          <thead>
            <tr>
              <th>Add-on</th>
              <th>Driver</th>
              <th>Units Label</th>
              {styleNames.map((styleName) => (
                <th key={styleName}>{styleName}<br /><span className="muted">Selling Price</span></th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pricing.addOns.map((addOn, index) => (
              <tr key={`${addOn.name}-${index}`}>
                <td>
                  <input
                    value={addOn.name}
                    onChange={(e) => updateAddOnField(index, "name", e.target.value)}
                  />
                </td>
                <td>
                  <select value={addOn.driver} onChange={(e) => updateAddOnField(index, "driver", e.target.value)}>
                    {ADD_ON_DRIVERS.map((driver) => <option key={driver} value={driver}>{driver}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    value={addOn.units || ""}
                    onChange={(e) => updateAddOnField(index, "units", e.target.value)}
                  />
                </td>
                {styleNames.map((styleName) => (
                  <td key={styleName}>
                    <input
                      type="number"
                      step="0.01"
                      value={addOn.prices?.[styleName] ?? 0}
                      onChange={(e) => updateAddOnPrice(index, styleName, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button type="button" className="danger secondary small-button" onClick={() => removeAddOn(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Discount rules</h3>
      <p className="small muted">
        Add customer types or discount tiers in Dropdown options below. Then enter the default discount percentage here.
      </p>
      <div className="table-wrap">
        <table className="editable-table compact">
          <thead>
            <tr>
              <th>Customer Type</th>
              {discountTiers.map((tier) => <th key={tier}>{tier} Discount %</th>)}
            </tr>
          </thead>
          <tbody>
            {customerTypes.map((customerType) => (
              <tr key={customerType}>
                <td>{customerType}</td>
                {discountTiers.map((tier) => (
                  <td key={`${customerType}-${tier}`}>
                    <input
                      type="number"
                      step="0.1"
                      value={round2(Number(pricing.discounts?.[customerType]?.[tier] || 0) * 100)}
                      onChange={(e) => updateDiscount(customerType, tier, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Install pricing</h3>
      <p className="small muted">
        Build Type dropdown options pull from this table. Add new build types below under Dropdown options, then set the install price here.
      </p>
      <div className="table-wrap narrow-table">
        <table className="editable-table">
          <thead>
            <tr>
              <th>Build Type</th>
              <th>Install Price / Unit</th>
            </tr>
          </thead>
          <tbody>
            {buildTypes.map((buildType) => (
              <tr key={buildType}>
                <td>{buildType}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.install?.[buildType] || 0}
                    onChange={(e) => updateInstallPrice(buildType, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Dropdown options</h3>
      <p className="small muted">
        These options appear throughout the quote builder. Styles and add-ons are managed in their dedicated sections above because they also need pricing inputs.
      </p>
      <div className="reference-grid">
        {editableReferenceLists.map((listName) => (
          <div className="reference-card" key={listName}>
            <h4>{listName}</h4>
            <div className="chip-list">
              {(pricing.referenceLists[listName] || []).map((option) => (
                <span className="chip" key={String(option)}>
                  {option}
                  <button type="button" onClick={() => removeReferenceOption(listName, option)} aria-label={`Remove ${option}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="inline-add">
              <input
                placeholder={`Add ${listName}`}
                value={newReferenceOptions[listName] || ""}
                onChange={(e) => setNewReferenceOptions((current) => ({ ...current, [listName]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addReferenceOption(listName);
                  }
                }}
              />
              <button type="button" className="secondary" onClick={() => addReferenceOption(listName)}>
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function dash(value) {
  return value === undefined || value === null || value === "" ? "" : value;
}

function doorTypeLabel(slabs) {
  if (slabs === undefined || slabs === null || slabs === "") return "";
  const n = Number(slabs);
  if (n === 1) return "Single Door";
  if (n === 2) return "Double Door";
  if (Number.isFinite(n) && n > 0) return `${n}-Door Unit`;
  return String(slabs);
}

function formatUnitSummary(unit) {
  const parts = [
    unit.style,
    unit.dimensions,
    unit.totalSf ? `${unit.totalSf} SF` : "",
    doorTypeLabel(unit.slabs)
  ];
  return parts.filter(Boolean).join(" • ");
}

function formatAdditionalSpecs(unit) {
  const specs = [
    unit.buildType,
    unit.swing,
    unit.color,
    unit.glassTexture ? `${unit.glassTexture} glass` : "",
    unit.glassColor && unit.glassColor.trim() !== unit.glassTexture?.trim()
      ? `${unit.glassColor} glass color`
      : "",
    unit.accessibility && unit.accessibility !== "Standard" ? unit.accessibility : ""
  ];
  return specs.filter(Boolean).join(" • ");
}

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function pdfMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function safePdfText(value) {
  return String(value ?? "")
    .replace(/[•]/g, "-")
    .replace(/[×]/g, "x")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrapPdfText(text, font, size, maxWidth, maxLines = 3) {
  const words = safePdfText(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }

  if (line && lines.length < maxLines) lines.push(line);
  const consumed = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (consumed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (last && font.widthOfTextAtSize(`${last}...`, size) > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}...`;
  }
  return lines;
}

function drawRightText(page, text, xRight, y, options) {
  const safe = safePdfText(text);
  const width = options.font.widthOfTextAtSize(safe, options.size);
  page.drawText(safe, { ...options, x: xRight - width, y });
}

function drawMetricCard(page, label, value, x, y, width, fonts, colors, note = "") {
  page.drawRectangle({
    x,
    y,
    width,
    height: 56,
    color: colors.soft,
    borderColor: colors.border,
    borderWidth: 0.7
  });
  page.drawText(label.toUpperCase(), {
    x: x + 9,
    y: y + 38,
    size: 7,
    font: fonts.bold,
    color: colors.muted
  });
  page.drawText(pdfMoney(value), {
    x: x + 9,
    y: y + 18,
    size: 15,
    font: fonts.bold,
    color: colors.ink
  });
  if (note) {
    page.drawText(safePdfText(note), {
      x: x + 9,
      y: y + 6,
      size: 5.7,
      font: fonts.regular,
      color: colors.muted
    });
  }
}

function drawInvoiceHeader(page, result, fonts, colors, pageNumber, totalPages, compact = false) {
  const top = 752;
  page.drawText("PRESTIGE", {
    x: 38,
    y: top,
    size: compact ? 17 : 21,
    font: fonts.bold,
    color: colors.olive
  });
  page.drawText("IRON DOORS & GLAZING", {
    x: 38,
    y: top - 14,
    size: 7.5,
    font: fonts.bold,
    color: colors.ink
  });
  page.drawText("12525 Westfield Lakes Cir. | Winter Garden, FL 34787", {
    x: 38,
    y: top - 28,
    size: 6.8,
    font: fonts.regular,
    color: colors.muted
  });
  page.drawText("PrestigeIronDoors.com | (855) 767-2837", {
    x: 38,
    y: top - 39,
    size: 6.8,
    font: fonts.regular,
    color: colors.muted
  });

  drawRightText(page, compact ? "QUOTE - CONTINUED" : "QUOTE", 574, top - 2, {
    size: compact ? 12 : 16,
    font: fonts.bold,
    color: colors.ink
  });
  drawRightText(page, `Quote ${safePdfText(result.quoteNumber || "-")}`, 574, top - 21, {
    size: 7.5,
    font: fonts.regular,
    color: colors.muted
  });
  drawRightText(page, today, 574, top - 33, {
    size: 7.5,
    font: fonts.regular,
    color: colors.muted
  });
  drawRightText(page, `Quote page ${pageNumber} of ${totalPages}`, 574, top - 45, {
    size: 6.5,
    font: fonts.regular,
    color: colors.muted
  });

  page.drawLine({
    start: { x: 38, y: compact ? 690 : 692 },
    end: { x: 574, y: compact ? 690 : 692 },
    thickness: 1.2,
    color: colors.olive
  });
}

function drawCustomerBlock(page, result, fonts, colors) {
  page.drawRectangle({
    x: 38,
    y: 626,
    width: 536,
    height: 50,
    color: colors.white,
    borderColor: colors.border,
    borderWidth: 0.7
  });

  const columns = [
    ["CUSTOMER / PROJECT", result.preparedFor?.company || "-"],
    ["CONTACT", result.preparedFor?.contact || "-"],
    ["PREPARED BY", result.preparedBy?.name || "-"]
  ];
  const widths = [215, 155, 166];
  let x = 38;
  columns.forEach(([label, value], index) => {
    if (index) {
      page.drawLine({
        start: { x, y: 626 },
        end: { x, y: 676 },
        thickness: 0.6,
        color: colors.border
      });
    }
    page.drawText(label, {
      x: x + 10,
      y: 657,
      size: 6.5,
      font: fonts.bold,
      color: colors.muted
    });
    const lines = wrapPdfText(value, fonts.bold, 9.5, widths[index] - 20, 2);
    lines.forEach((line, lineIndex) => page.drawText(line, {
      x: x + 10,
      y: 640 - lineIndex * 11,
      size: 9.5,
      font: fonts.bold,
      color: colors.ink
    }));
    x += widths[index];
  });
}

function buildDoorPdfDescription(unit) {
  const summary = [formatUnitSummary(unit), formatAdditionalSpecs(unit)]
    .filter(Boolean)
    .join(" | ");
  const addOns = unit.selectedAddOns?.length ? `Add-ons: ${unit.selectedAddOns.join(", ")}` : "";
  const install = unit.lineInstallationGross
    ? `Installation included: ${pdfMoney(unit.lineInstallationNet || 0)}`
    : "";
  return [summary, addOns, install].filter(Boolean).join(" | ");
}

function createDoorRowLayout(unit, fonts, descriptionWidth) {
  const titleSize = 8.1;
  const titleLineHeight = 8.7;
  const descriptionSize = 6.1;
  const descriptionLineHeight = 7.1;
  const titleLines = wrapPdfText(
    unit.name || "Door",
    fonts.bold,
    titleSize,
    descriptionWidth,
    Number.POSITIVE_INFINITY
  );
  const description = buildDoorPdfDescription(unit);
  const descriptionLines = description
    ? wrapPdfText(description, fonts.regular, descriptionSize, descriptionWidth, Number.POSITIVE_INFINITY)
    : [];
  const measuredHeight =
    13 +
    titleLines.length * titleLineHeight +
    3 +
    descriptionLines.length * descriptionLineHeight +
    8;
  const rowHeight = normalizeDoorRowHeight(measuredHeight);

  return {
    unit,
    rowHeight,
    titleLines,
    descriptionLines,
    titleSize,
    titleLineHeight,
    descriptionSize,
    descriptionLineHeight
  };
}

function paginateDoorRows(units, fonts) {
  const descriptionWidth = 205 - 14;
  const rows = (units || []).map((unit) => createDoorRowLayout(unit, fonts, descriptionWidth));
  return paginateIndivisibleRows(rows, {
    firstPageCapacity: 390,
    continuationCapacity: 556,
    maxFirstPageRows: 5
  });
}

function drawLineItemsTable(page, rowLayouts, startY, fonts, colors, startIndex = 0) {
  const x = 38;
  const widths = [24, 205, 36, 80, 80, 111];
  const headers = ["#", "DOOR / SPECIFICATIONS", "QTY", "RETAIL", "DISCOUNT", "PACKAGE PRICE"];
  const headerHeight = 24;

  page.drawRectangle({ x, y: startY - headerHeight, width: 536, height: headerHeight, color: colors.ink });
  let cursorX = x;
  headers.forEach((header, index) => {
    const centered = index !== 1;
    const textWidth = fonts.bold.widthOfTextAtSize(header, 6.3);
    page.drawText(header, {
      x: centered ? cursorX + (widths[index] - textWidth) / 2 : cursorX + 7,
      y: startY - 15,
      size: 6.3,
      font: fonts.bold,
      color: colors.white
    });
    cursorX += widths[index];
  });

  let y = startY - headerHeight;
  rowLayouts.forEach((layout, index) => {
    const unit = layout.unit;
    const rowHeight = layout.rowHeight;
    const rowBottom = y - rowHeight;
    page.drawRectangle({
      x,
      y: rowBottom,
      width: 536,
      height: rowHeight,
      color: index % 2 ? colors.soft : colors.white,
      borderColor: colors.border,
      borderWidth: 0.45
    });

    let cx = x;
    widths.slice(0, -1).forEach((width) => {
      cx += width;
      page.drawLine({
        start: { x: cx, y: rowBottom },
        end: { x: cx, y },
        thickness: 0.35,
        color: colors.border
      });
    });

    const itemNumber = String(startIndex + index + 1);
    const itemWidth = fonts.bold.widthOfTextAtSize(itemNumber, 8);
    const numericBaseline = rowBottom + rowHeight / 2 - 3;
    page.drawText(itemNumber, {
      x: x + (widths[0] - itemWidth) / 2,
      y: numericBaseline,
      size: 8,
      font: fonts.bold,
      color: colors.ink
    });

    const descriptionX = x + widths[0] + 7;
    layout.titleLines.forEach((line, lineIndex) => page.drawText(line, {
      x: descriptionX,
      y: y - 13 - lineIndex * layout.titleLineHeight,
      size: layout.titleSize,
      font: fonts.bold,
      color: colors.ink
    }));
    const descriptionStartY = y - 13 - layout.titleLines.length * layout.titleLineHeight - 3;
    layout.descriptionLines.forEach((line, lineIndex) => page.drawText(line, {
      x: descriptionX,
      y: descriptionStartY - lineIndex * layout.descriptionLineHeight,
      size: layout.descriptionSize,
      font: fonts.regular,
      color: colors.muted
    }));

    const values = [
      String(unit.quantity || ""),
      pdfMoney(unit.linePackageRetail || 0),
      unit.linePackageDiscountAmount ? `-${pdfMoney(unit.linePackageDiscountAmount)}` : pdfMoney(0),
      pdfMoney(unit.linePackagePrice || 0)
    ];
    const starts = [x + widths[0] + widths[1], x + widths[0] + widths[1] + widths[2], x + widths[0] + widths[1] + widths[2] + widths[3], x + widths[0] + widths[1] + widths[2] + widths[3] + widths[4]];
    const cellWidths = widths.slice(2);
    values.forEach((value, valueIndex) => {
      const font = valueIndex === 3 ? fonts.bold : fonts.regular;
      const size = valueIndex === 0 ? 8 : 7.2;
      const textWidth = font.widthOfTextAtSize(value, size);
      page.drawText(value, {
        x: starts[valueIndex] + (cellWidths[valueIndex] - textWidth) / 2,
        y: numericBaseline,
        size,
        font,
        color: colors.ink
      });
    });

    y = rowBottom;
  });

  return y;
}

async function ensurePdfLibrary() {
  if (window.PDFLib) return window.PDFLib;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("The PDF generator could not load."));
    document.head.appendChild(script);
  });

  if (!window.PDFLib) throw new Error("The PDF generator could not load.");
  return window.PDFLib;
}

async function buildCombinedInvoicePdf(result, supplements) {
  const pdfLib = await ensurePdfLibrary();
  const { PDFDocument, StandardFonts, rgb } = pdfLib;
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const colors = {
    olive: rgb(0.36, 0.37, 0.07),
    ink: rgb(0.12, 0.14, 0.13),
    muted: rgb(0.35, 0.37, 0.35),
    border: rgb(0.78, 0.79, 0.75),
    soft: rgb(0.96, 0.96, 0.93),
    white: rgb(1, 1, 1)
  };

  const units = result.units || [];
  const invoicePages = paginateDoorRows(units, fonts);
  const firstPageRows = invoicePages[0]?.rows || [];
  const continuationPages = invoicePages.slice(1);
  const invoicePageCount = invoicePages.length;

  const firstPage = pdfDoc.addPage([612, 792]);
  drawInvoiceHeader(firstPage, result, fonts, colors, 1, invoicePageCount);
  drawCustomerBlock(firstPage, result, fonts, colors);

  const metrics = [
    ["Package Retail Price", result.totals.suggestedRetail, "Before discounts"],
    ["Total Discounts", result.totals.totalDiscountAmount, "Door units + installation"],
    ["Total Package Price", result.totals.quoteTotal, "After all discounts"],
    ["Production Deposit", result.totals.productionDepositDue, `${Math.round((result.totals.productionDepositRate || 0.5) * 100)}% of discounted door units`]
  ];
  const metricWidth = 130;
  metrics.forEach((metric, index) => {
    drawMetricCard(firstPage, metric[0], metric[1], 38 + index * 135.3, 552, metricWidth, fonts, colors, metric[2]);
  });

  drawLineItemsTable(firstPage, firstPageRows, 532, fonts, colors, 0);

  firstPage.drawText("PAYMENT SUMMARY", {
    x: 38,
    y: 112,
    size: 7,
    font: bold,
    color: colors.olive
  });
  firstPage.drawText(
    `Line-item package prices include installation. Each door-unit discount applies to base door price plus all selected add-ons. Production deposit excludes installation and is based on discounted door units (${pdfMoney(result.totals.productionDepositBasis)}).`,
    { x: 38, y: 98, size: 6.6, font: regular, color: colors.muted }
  );
  const contact = [result.preparedBy?.email, result.preparedBy?.phone].filter(Boolean).join(" | ");
  if (contact) {
    firstPage.drawText(safePdfText(contact), {
      x: 38,
      y: 84,
      size: 6.6,
      font: regular,
      color: colors.muted
    });
  }
  firstPage.drawLine({ start: { x: 38, y: 58 }, end: { x: 574, y: 58 }, thickness: 0.5, color: colors.border });
  firstPage.drawText("Pricing is subject to final field verification, approved specifications, freight, lead times, and signed order terms.", {
    x: 38,
    y: 43,
    size: 6.2,
    font: regular,
    color: colors.muted
  });

  continuationPages.forEach((invoicePage, index) => {
    const page = pdfDoc.addPage([612, 792]);
    drawInvoiceHeader(page, result, fonts, colors, index + 2, invoicePageCount, true);
    page.drawText(`Additional doors for ${safePdfText(result.preparedFor?.company || "customer")}`, {
      x: 38,
      y: 670,
      size: 9,
      font: bold,
      color: colors.ink
    });
    drawLineItemsTable(page, invoicePage.rows, 650, fonts, colors, invoicePage.startIndex);
    page.drawLine({ start: { x: 38, y: 52 }, end: { x: 574, y: 52 }, thickness: 0.5, color: colors.border });
    page.drawText("Package totals and production deposit appear on quote page 1.", {
      x: 38,
      y: 37,
      size: 6.5,
      font: regular,
      color: colors.muted
    });
  });

  const skipped = [];
  for (const supplement of supplements || []) {
    try {
      const bytes = await fetchSupplementPdf(supplement);
      const source = await PDFDocument.load(bytes);
      const copiedPages = await pdfDoc.copyPages(source, source.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    } catch (error) {
      skipped.push(`${supplement.name}: ${error.message}`);
    }
  }

  return { bytes: await pdfDoc.save(), skipped };
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function SupplementManager({ supplements, setSupplements, setStatus }) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const invalid = files.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (invalid) {
      setStatus(`${invalid.name} is not a PDF.`);
      return;
    }

    setUploading(true);
    try {
      const next = await uploadSupplements(files);
      setSupplements(next);
      setStatus(`${files.length} quote supplement${files.length === 1 ? "" : "s"} saved in this browser.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function removeSupplement(name) {
    try {
      const next = await deleteSupplement(name);
      setSupplements(next);
      setStatus(`Removed ${name}.`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <section id="invoice-supplements" className="card supplement-manager">
      <div className="section-header">
        <div>
          <h2>Quote Supplements</h2>
          <p className="muted">
            Every PDF here is automatically appended after the generated quote. Files are stored in this browser and print in filename order, so use prefixes such as 01, 02, and 03 to control sequence.
          </p>
        </div>
        <label className="upload-button">
          {uploading ? "Uploading…" : "Upload PDFs"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            disabled={uploading}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div
        className="supplement-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        Drop PDF pages or documents here
      </div>

      {supplements.length ? (
        <div className="supplement-list">
          {supplements.map((supplement, index) => (
            <div className="supplement-row" key={supplement.name}>
              <span className="supplement-order">{index + 1}</span>
              <div>
                <strong>{supplement.name}</strong>
                <span>{formatFileSize(supplement.sizeBytes)}</span>
              </div>
              <a href={supplement.url} target="_blank" rel="noreferrer">Preview</a>
              <button type="button" className="danger secondary small-button" onClick={() => removeSupplement(supplement.name)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No supplements uploaded. The quote PDF will contain only the Prestige quote pages.</p>
      )}
    </section>
  );
}

function InvoicePreviewPage({ result, units, pageNumber, totalPages, startIndex = 0, firstPage = false }) {
  return (
    <div className="invoice-preview-page">
      <div className="invoice-preview-header">
        <div>
          <strong>PRESTIGE</strong>
          <span>IRON DOORS & GLAZING</span>
          <small>12525 Westfield Lakes Cir. · Winter Garden, FL 34787 · (855) 767-2837</small>
        </div>
        <div>
          <b>{firstPage ? "QUOTE" : "QUOTE — CONTINUED"}</b>
          <span>Quote {result.quoteNumber || "—"}</span>
          <span>{today}</span>
          <small>Quote page {pageNumber} of {totalPages}</small>
        </div>
      </div>

      {firstPage ? (
        <>
          <div className="invoice-customer-strip">
            <div><span>Customer / Project</span><strong>{result.preparedFor?.company || "—"}</strong></div>
            <div><span>Contact</span><strong>{result.preparedFor?.contact || "—"}</strong></div>
            <div><span>Prepared By</span><strong>{result.preparedBy?.name || "—"}</strong></div>
          </div>
          <div className="invoice-metrics">
            <div><span>Package Retail Price</span><strong>{currency.format(result.totals.suggestedRetail || 0)}</strong><small>Before discounts</small></div>
            <div><span>Total Discounts</span><strong>-{currency.format(result.totals.totalDiscountAmount || 0)}</strong><small>Door units + installation</small></div>
            <div><span>Total Package Price</span><strong>{currency.format(result.totals.quoteTotal || 0)}</strong><small>After all discounts</small></div>
            <div><span>Production Deposit</span><strong>{currency.format(result.totals.productionDepositDue || 0)}</strong><small>Discounted door units only</small></div>
          </div>
        </>
      ) : (
        <h3 className="continuation-title">Additional doors for {result.preparedFor?.company || "customer"}</h3>
      )}

      <table className="compact-invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Door / Specifications</th>
            <th>Qty</th>
            <th>Retail</th>
            <th>Discount</th>
            <th>Package Price</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit, index) => (
            <tr key={unit.id}>
              <td>{startIndex + index + 1}</td>
              <td>
                <strong>{unit.name || `Door ${startIndex + index + 1}`}</strong>
                <span>{formatUnitSummary(unit)}</span>
                {formatAdditionalSpecs(unit) ? <span>{formatAdditionalSpecs(unit)}</span> : null}
                {unit.selectedAddOns?.length ? <span>Add-ons: {unit.selectedAddOns.join(", ")}</span> : null}
                {unit.lineInstallationGross ? <span>Installation included: {currency.format(unit.lineInstallationNet || 0)}</span> : null}
              </td>
              <td>{unit.quantity}</td>
              <td>{currency.format(unit.linePackageRetail || 0)}</td>
              <td>{unit.linePackageDiscountAmount ? `-${currency.format(unit.linePackageDiscountAmount)}` : currency.format(0)}</td>
              <td>{currency.format(unit.linePackagePrice || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {firstPage ? (
        <p className="invoice-deposit-note">
          Each door-unit discount applies to the base door price plus all selected add-ons. Line-item package prices include installation, but the production deposit excludes installation and is based on discounted door units ({currency.format(result.totals.productionDepositBasis || 0)}).
        </p>
      ) : (
        <p className="invoice-deposit-note">Package totals and production deposit appear on quote page 1.</p>
      )}
    </div>
  );
}

function QuoteOutput({ result, supplements, setStatus }) {
  const [generating, setGenerating] = useState(false);
  if (!result) return null;

  const units = result.units || [];
  const invoiceGroups = [units.slice(0, 5), ...chunkItems(units.slice(5), 8)];

  async function openCombinedPdf() {
    setGenerating(true);
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write("<p style='font-family:Arial;padding:24px'>Generating combined quote PDF…</p>");
    }

    try {
      const { bytes, skipped } = await buildCombinedInvoicePdf(result, supplements);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (previewWindow) {
        previewWindow.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${result.quoteNumber || "Prestige-Quote"}.pdf`;
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 120000);
      setStatus(skipped.length
        ? `PDF created, but ${skipped.length} supplement${skipped.length === 1 ? "" : "s"} could not be appended: ${skipped.join("; ")}`
        : `Combined quote PDF created with ${supplements.length} supplement${supplements.length === 1 ? "" : "s"}.`);
    } catch (error) {
      if (previewWindow) previewWindow.close();
      setStatus(error.message || "Could not generate the combined quote PDF.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="card quote-output compact-output">
      <div className="quote-toolbar no-print">
        <div>
          <h2>Printable Quote</h2>
          <p className="muted">
            Up to five doors fit on quote page 1. {supplements.length} uploaded supplement{supplements.length === 1 ? "" : "s"} will be appended automatically.
          </p>
        </div>
        <button type="button" onClick={openCombinedPdf} disabled={generating}>
          {generating ? "Building PDF…" : "Open Combined PDF"}
        </button>
      </div>

      <div className="invoice-preview-stack">
        {invoiceGroups.map((group, index) => (
          <InvoicePreviewPage
            key={index}
            result={result}
            units={group}
            pageNumber={index + 1}
            totalPages={invoiceGroups.length}
            startIndex={index === 0 ? 0 : 5 + (index - 1) * 8}
            firstPage={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [config, setConfig] = useState(null);
  const [quote, setQuote] = useState(null);
  const [result, setResult] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function boot() {
      try {
        const [loadedConfig, sampleQuote, loadedSupplements] = await Promise.all([
          getConfig(),
          getSampleQuote(),
          getSupplements()
        ]);
        setConfig(loadedConfig);
        setQuote(sampleQuote);
        setSupplements(loadedSupplements);
      } catch (error) {
        setStatus(error.message);
      }
    }

    boot();
  }, []);

  useEffect(() => {
    if (!quote) return;

    const timeout = setTimeout(async () => {
      try {
        const calculated = await calculateQuote(quote);
        setResult(calculated);
        setStatus("");
      } catch (error) {
        setStatus(error.message);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [quote]);

  const nextUnitId = useMemo(() => {
    if (!quote?.units?.length) return 1;
    return Math.max(...quote.units.map((unit) => Number(unit.id) || 0)) + 1;
  }, [quote]);

  if (!config || !quote) {
    return <main className="app-shell">Loading estimator…</main>;
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Prestige estimator MVP</p>
          <h1>Estimate Builder</h1>
          <p>
            Internal quote builder with browser-local pricing controls and combined quote PDFs.
          </p>
        </div>
        <div className="header-actions">
          <span className="internal-badge">Internal tool</span>
          <a className="header-link" href="#invoice-supplements">Supplements</a>
          <a className="header-link" href="#pricing-controls">Pricing & Options</a>
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              try {
                const saved = await saveQuote(quote);
                setStatus(`Saved ${saved.id}`);
              } catch (error) {
                setStatus(error.message);
              }
            }}
          >
            Save Quote
          </button>
        </div>
      </header>

      {status ? <p className="status">{status}</p> : null}

      <PricingGuide config={config} />

      <QuoteHeader quote={quote} setQuote={setQuote} config={config} />

      <div className="unit-actions">
        <h2>Units</h2>
        <button
          type="button"
          onClick={() =>
            setQuote({
              ...quote,
              units: [...quote.units, blankUnit(nextUnitId)]
            })
          }
        >
          Add Unit
        </button>
      </div>

      {quote.units.map((unit) => (
        <UnitEditor
          key={unit.id}
          unit={unit}
          quote={quote}
          setQuote={setQuote}
          config={config}
        />
      ))}

      <SupplementManager supplements={supplements} setSupplements={setSupplements} setStatus={setStatus} />
      <QuoteOutput result={result} supplements={supplements} setStatus={setStatus} />
      <PricingAdminPanel
        setStatus={setStatus}
        onPricingSaved={(newConfig) => {
          setConfig(newConfig);
          setQuote((current) => ({ ...current }));
        }}
      />
    </main>
  );
}
