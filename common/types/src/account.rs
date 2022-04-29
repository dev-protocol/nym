use crate::currency::{CurrencyDenom, MajorCurrencyAmount};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[cfg_attr(test, derive(ts_rs::TS))]
#[cfg_attr(
    test,
    ts(
        export,
        export_to = "../../ts-packages/types/src/types/rust/Account.ts"
    )
)]
#[derive(Serialize, Deserialize, JsonSchema)]
pub struct Account {
    pub contract_address: String,
    pub client_address: String,
    pub denom: CurrencyDenom,
}

impl Account {
    pub fn new(contract_address: String, client_address: String, denom: CurrencyDenom) -> Self {
        Account {
            contract_address,
            client_address,
            denom,
        }
    }
}

#[cfg_attr(test, derive(ts_rs::TS))]
#[cfg_attr(
    test,
    ts(
        export,
        export_to = "../../ts-packages/types/src/types/rust/AccountWithMnemonic.ts"
    )
)]
#[derive(Serialize, Deserialize)]
pub struct AccountWithMnemonic {
    pub account: Account,
    pub mnemonic: String,
}

#[cfg_attr(test, derive(ts_rs::TS))]
#[cfg_attr(
    test,
    ts(
        export,
        export_to = "../../ts-packages/types/src/types/rust/Balance.ts"
    )
)]
#[derive(Serialize, Deserialize)]
pub struct Balance {
    pub amount: MajorCurrencyAmount,
    pub printable_balance: String,
}
