import pg from "pg";

// TODO: Put this in a private config file.
const Pool = pg.Pool;
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "demo_integration",
  password: "password",
  port: 5432,
});

// TODO: In the real world all this would be done in a separate migrations script
export const setUpDB = async (): Promise<void> => {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS USERS ( \
      ID SERIAL PRIMARY KEY, \
      CUSTOMER_UID VARCHAR(256), \
      REFRESH_TOKEN VARCHAR(256) \
    )"
  );
  console.log("Finished DB Set up");
};

export const getUserByCustomerUid = async (
  customerUid: string
): Promise<any | null> => {
  const results = await pool.query(
    "SELECT * FROM USERS WHERE CUSTOMER_UID = $1",
    [customerUid]
  );

  return results.rows.length ? results.rows[0] : null;
};

export const createUser = async (
  customerUid: string,
  refreshToken: string
): Promise<any | null> => {
  const results = await pool.query(
    "INSERT INTO USERS (CUSTOMER_UID, REFRESH_TOKEN) VALUES ($1, $2)",
    [customerUid, refreshToken]
  );

  return results.rows.length ? results.rows[0] : null;
};
