// Copyright 2022 - Nym Technologies SA <contact@nymtech.net>
// SPDX-License-Identifier: Apache-2.0

#[cfg(test)]
pub mod helpers {
    use crate::instantiate;
    use coconut_dkg_common::msg::InstantiateMsg;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info, MockApi, MockQuerier};
    use cosmwasm_std::{Empty, MemoryStorage, OwnedDeps};

    pub fn init_contract() -> OwnedDeps<MemoryStorage, MockApi, MockQuerier<Empty>> {
        let mut deps = mock_dependencies();
        let msg = InstantiateMsg {};
        let env = mock_env();
        let info = mock_info("creator", &[]);
        instantiate(deps.as_mut(), env, info, msg).unwrap();
        deps
    }
}