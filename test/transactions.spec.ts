import { it, expect, beforeAll, afterAll, describe, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New transactions",
      amount: 500,
      type: "credit",
    });
    expect(response.statusCode).toEqual(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transactions",
        amount: 500,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("set-Cookie");
    // if (cookies) {
    const listTransactionsReponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    console.log("log :", listTransactionsReponse.body.transactions);

    expect(listTransactionsReponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transactions",
        amount: 500,
      }),
    ]);
    // }
  });

  it("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transactions",
        amount: 500,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("set-Cookie");
    // if (cookies) {
    const listTransactionsReponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    const transactionId = listTransactionsReponse.body.transactions[0].id;
    console.log("id", transactionId);

    const getTransactionReponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies);

    console.log("body", getTransactionReponse.body);

    expect(getTransactionReponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transactions",
        amount: 500,
      }),
    );
    // }
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transactions",
        amount: 500,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("set-Cookie");
    // if (cookies) {
    const listTransactionsReponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    console.log("log :", listTransactionsReponse.body.transactions);

    expect(listTransactionsReponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transactions",
        amount: 500,
      }),
    ]);
    // }
  });

  it.only("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transactions",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("set-Cookie");

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transactions",
        amount: 2000,
        type: "debit",
      });

    // if (cookies) {
    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies);

    console.log("sumarry : ", summaryResponse.body);

    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      }),
    );
    // }
  });
});
