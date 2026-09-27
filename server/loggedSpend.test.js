import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companyProfileNeedsSetup } from "../src/lib/companyProfile.js";
import { loggedSpend } from "../src/lib/loggedSpend.js";

describe("logged spend", () => {
  it("does not add a receipt amount that already belongs to an expense", () => {
    const spend = loggedSpend({
      expenses: [{ id: "e1", amount: 40, photo_url: "/files/r1.jpg", job_id: "j1" }],
      timeline: [{ type: "receipt", photo_url: "/files/r1.jpg", amount: 40, expense_id: "e1", job_id: "j1" }],
    });
    assert.equal(spend.expenses, 40);
    assert.equal(spend.receiptOnly, 0);
    assert.equal(spend.total, 40);
  });

  it("keeps a receipt that is not tied to an expense", () => {
    const spend = loggedSpend({
      expenses: [{ id: "e1", amount: 40, job_id: "j1" }],
      timeline: [{ type: "receipt", photo_url: "/files/other.jpg", amount: 15, job_id: "j1" }],
    });
    assert.equal(spend.total, 55);
  });
});

describe("company profile setup", () => {
  it("asks for a company name when the profile is missing or blank", () => {
    assert.equal(companyProfileNeedsSetup(null), true);
    assert.equal(companyProfileNeedsSetup({ name: "  " }), true);
    assert.equal(companyProfileNeedsSetup({ name: "Summit" }), false);
  });
});
