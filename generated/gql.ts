/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query checkUserExists($employee_id: String = \"\", $phone_number: String = \"\", $organization_id: uuid = \"\") {\n  user_organizations(\n    where: {employee_id: {_eq: $employee_id}, user: {phone_number: {_eq: $phone_number}}, organization_id: {_eq: $organization_id}}\n  ) {\n    employee_id\n    user_id\n  }\n}": typeof types.CheckUserExistsDocument,
    "query fetchAllOrganisations {\n  organizations {\n    id\n    name\n  }\n}": typeof types.FetchAllOrganisationsDocument,
    "mutation createRide($object: ride_details_insert_input = {}) {\n  insert_ride_details_one(object: $object) {\n    created_at\n    id\n  }\n}": typeof types.CreateRideDocument,
    "mutation updateRideEndTime($id: uuid = \"\", $end_time: timestamp = \"\", $total_cost: numeric = \"\") {\n  update_ride_details_by_pk(\n    pk_columns: {id: $id}\n    _set: {end_time: $end_time, total_cost: $total_cost}\n  ) {\n    id\n    end_time\n    created_at\n  }\n}": typeof types.UpdateRideEndTimeDocument,
    "query fetchAllHubs {\n  hubs {\n    id\n    latitude\n    longitude\n    name\n    organization_id\n    created_at\n  }\n}": typeof types.FetchAllHubsDocument,
    "query fetchCompletedRides($id: uuid = \"\") {\n  ride_details(\n    where: {ride_steps: {ride_step: {ride_steps: {steps: {_eq: RIDE_ENDED}}}}, user_id: {_eq: $id}}\n  ) {\n    created_at\n    end_time\n    end_hub_id\n    id\n    scooter_id\n    start_hub_id\n    start_time\n    total_cost\n    ride_steps {\n      id\n      steps\n    }\n    hubByStartHubId {\n      latitude\n      longitude\n      name\n      id\n    }\n  }\n}": typeof types.FetchCompletedRidesDocument,
    "query fetchScooterByNumber($regNo: String = \"SCOOTER1\") {\n  scooters(where: {registration_number: {_ilike: $regNo}}) {\n    id\n    is_active\n    latitude\n    longitude\n    registration_number\n    status\n    hub_id\n  }\n}": typeof types.FetchScooterByNumberDocument,
    "mutation createRideStep($steps: ride_step_enum, $ride_details_id: uuid = \"\") {\n  insert_ride_steps_one(\n    object: {steps: $steps, ride_details_id: $ride_details_id}\n  ) {\n    id\n    created_at\n  }\n}": typeof types.CreateRideStepDocument,
    "query fetchCurrentUser {\n  users {\n    email\n    id\n    full_name\n    phone_number\n    user_organizations {\n      organization {\n        id\n        name\n      }\n    }\n    phone_number\n  }\n}": typeof types.FetchCurrentUserDocument,
    "mutation updateUser($id: uuid = \"\", $_set: users_set_input = {}) {\n  update_users_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n  }\n}": typeof types.UpdateUserDocument,
    "mutation createWallet($object: wallets_insert_input = {}) {\n  insert_wallets_one(object: $object) {\n    balance\n    created_at\n    id\n  }\n}": typeof types.CreateWalletDocument,
    "mutation deductBalanceFromSecurity($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}": typeof types.DeductBalanceFromSecurityDocument,
    "mutation deductBalanceFromWallet($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}": typeof types.DeductBalanceFromWalletDocument,
    "query fetchUserWallet {\n  wallets {\n    balance\n    id\n    security_deposit\n    transactions {\n      ride_id\n      amount\n      ride {\n        end_time\n        start_time\n        total_cost\n        hub {\n          id\n          name\n        }\n      }\n    }\n  }\n}": typeof types.FetchUserWalletDocument,
    "mutation updateWalletBalance($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}": typeof types.UpdateWalletBalanceDocument,
    "mutation updateWalletSecurityDeposit($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}": typeof types.UpdateWalletSecurityDepositDocument,
};
const documents: Documents = {
    "query checkUserExists($employee_id: String = \"\", $phone_number: String = \"\", $organization_id: uuid = \"\") {\n  user_organizations(\n    where: {employee_id: {_eq: $employee_id}, user: {phone_number: {_eq: $phone_number}}, organization_id: {_eq: $organization_id}}\n  ) {\n    employee_id\n    user_id\n  }\n}": types.CheckUserExistsDocument,
    "query fetchAllOrganisations {\n  organizations {\n    id\n    name\n  }\n}": types.FetchAllOrganisationsDocument,
    "mutation createRide($object: ride_details_insert_input = {}) {\n  insert_ride_details_one(object: $object) {\n    created_at\n    id\n  }\n}": types.CreateRideDocument,
    "mutation updateRideEndTime($id: uuid = \"\", $end_time: timestamp = \"\", $total_cost: numeric = \"\") {\n  update_ride_details_by_pk(\n    pk_columns: {id: $id}\n    _set: {end_time: $end_time, total_cost: $total_cost}\n  ) {\n    id\n    end_time\n    created_at\n  }\n}": types.UpdateRideEndTimeDocument,
    "query fetchAllHubs {\n  hubs {\n    id\n    latitude\n    longitude\n    name\n    organization_id\n    created_at\n  }\n}": types.FetchAllHubsDocument,
    "query fetchCompletedRides($id: uuid = \"\") {\n  ride_details(\n    where: {ride_steps: {ride_step: {ride_steps: {steps: {_eq: RIDE_ENDED}}}}, user_id: {_eq: $id}}\n  ) {\n    created_at\n    end_time\n    end_hub_id\n    id\n    scooter_id\n    start_hub_id\n    start_time\n    total_cost\n    ride_steps {\n      id\n      steps\n    }\n    hubByStartHubId {\n      latitude\n      longitude\n      name\n      id\n    }\n  }\n}": types.FetchCompletedRidesDocument,
    "query fetchScooterByNumber($regNo: String = \"SCOOTER1\") {\n  scooters(where: {registration_number: {_ilike: $regNo}}) {\n    id\n    is_active\n    latitude\n    longitude\n    registration_number\n    status\n    hub_id\n  }\n}": types.FetchScooterByNumberDocument,
    "mutation createRideStep($steps: ride_step_enum, $ride_details_id: uuid = \"\") {\n  insert_ride_steps_one(\n    object: {steps: $steps, ride_details_id: $ride_details_id}\n  ) {\n    id\n    created_at\n  }\n}": types.CreateRideStepDocument,
    "query fetchCurrentUser {\n  users {\n    email\n    id\n    full_name\n    phone_number\n    user_organizations {\n      organization {\n        id\n        name\n      }\n    }\n    phone_number\n  }\n}": types.FetchCurrentUserDocument,
    "mutation updateUser($id: uuid = \"\", $_set: users_set_input = {}) {\n  update_users_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n  }\n}": types.UpdateUserDocument,
    "mutation createWallet($object: wallets_insert_input = {}) {\n  insert_wallets_one(object: $object) {\n    balance\n    created_at\n    id\n  }\n}": types.CreateWalletDocument,
    "mutation deductBalanceFromSecurity($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}": types.DeductBalanceFromSecurityDocument,
    "mutation deductBalanceFromWallet($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}": types.DeductBalanceFromWalletDocument,
    "query fetchUserWallet {\n  wallets {\n    balance\n    id\n    security_deposit\n    transactions {\n      ride_id\n      amount\n      ride {\n        end_time\n        start_time\n        total_cost\n        hub {\n          id\n          name\n        }\n      }\n    }\n  }\n}": types.FetchUserWalletDocument,
    "mutation updateWalletBalance($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}": types.UpdateWalletBalanceDocument,
    "mutation updateWalletSecurityDeposit($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}": types.UpdateWalletSecurityDepositDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query checkUserExists($employee_id: String = \"\", $phone_number: String = \"\", $organization_id: uuid = \"\") {\n  user_organizations(\n    where: {employee_id: {_eq: $employee_id}, user: {phone_number: {_eq: $phone_number}}, organization_id: {_eq: $organization_id}}\n  ) {\n    employee_id\n    user_id\n  }\n}"): (typeof documents)["query checkUserExists($employee_id: String = \"\", $phone_number: String = \"\", $organization_id: uuid = \"\") {\n  user_organizations(\n    where: {employee_id: {_eq: $employee_id}, user: {phone_number: {_eq: $phone_number}}, organization_id: {_eq: $organization_id}}\n  ) {\n    employee_id\n    user_id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query fetchAllOrganisations {\n  organizations {\n    id\n    name\n  }\n}"): (typeof documents)["query fetchAllOrganisations {\n  organizations {\n    id\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createRide($object: ride_details_insert_input = {}) {\n  insert_ride_details_one(object: $object) {\n    created_at\n    id\n  }\n}"): (typeof documents)["mutation createRide($object: ride_details_insert_input = {}) {\n  insert_ride_details_one(object: $object) {\n    created_at\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateRideEndTime($id: uuid = \"\", $end_time: timestamp = \"\", $total_cost: numeric = \"\") {\n  update_ride_details_by_pk(\n    pk_columns: {id: $id}\n    _set: {end_time: $end_time, total_cost: $total_cost}\n  ) {\n    id\n    end_time\n    created_at\n  }\n}"): (typeof documents)["mutation updateRideEndTime($id: uuid = \"\", $end_time: timestamp = \"\", $total_cost: numeric = \"\") {\n  update_ride_details_by_pk(\n    pk_columns: {id: $id}\n    _set: {end_time: $end_time, total_cost: $total_cost}\n  ) {\n    id\n    end_time\n    created_at\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query fetchAllHubs {\n  hubs {\n    id\n    latitude\n    longitude\n    name\n    organization_id\n    created_at\n  }\n}"): (typeof documents)["query fetchAllHubs {\n  hubs {\n    id\n    latitude\n    longitude\n    name\n    organization_id\n    created_at\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query fetchCompletedRides($id: uuid = \"\") {\n  ride_details(\n    where: {ride_steps: {ride_step: {ride_steps: {steps: {_eq: RIDE_ENDED}}}}, user_id: {_eq: $id}}\n  ) {\n    created_at\n    end_time\n    end_hub_id\n    id\n    scooter_id\n    start_hub_id\n    start_time\n    total_cost\n    ride_steps {\n      id\n      steps\n    }\n    hubByStartHubId {\n      latitude\n      longitude\n      name\n      id\n    }\n  }\n}"): (typeof documents)["query fetchCompletedRides($id: uuid = \"\") {\n  ride_details(\n    where: {ride_steps: {ride_step: {ride_steps: {steps: {_eq: RIDE_ENDED}}}}, user_id: {_eq: $id}}\n  ) {\n    created_at\n    end_time\n    end_hub_id\n    id\n    scooter_id\n    start_hub_id\n    start_time\n    total_cost\n    ride_steps {\n      id\n      steps\n    }\n    hubByStartHubId {\n      latitude\n      longitude\n      name\n      id\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query fetchScooterByNumber($regNo: String = \"SCOOTER1\") {\n  scooters(where: {registration_number: {_ilike: $regNo}}) {\n    id\n    is_active\n    latitude\n    longitude\n    registration_number\n    status\n    hub_id\n  }\n}"): (typeof documents)["query fetchScooterByNumber($regNo: String = \"SCOOTER1\") {\n  scooters(where: {registration_number: {_ilike: $regNo}}) {\n    id\n    is_active\n    latitude\n    longitude\n    registration_number\n    status\n    hub_id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createRideStep($steps: ride_step_enum, $ride_details_id: uuid = \"\") {\n  insert_ride_steps_one(\n    object: {steps: $steps, ride_details_id: $ride_details_id}\n  ) {\n    id\n    created_at\n  }\n}"): (typeof documents)["mutation createRideStep($steps: ride_step_enum, $ride_details_id: uuid = \"\") {\n  insert_ride_steps_one(\n    object: {steps: $steps, ride_details_id: $ride_details_id}\n  ) {\n    id\n    created_at\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query fetchCurrentUser {\n  users {\n    email\n    id\n    full_name\n    phone_number\n    user_organizations {\n      organization {\n        id\n        name\n      }\n    }\n    phone_number\n  }\n}"): (typeof documents)["query fetchCurrentUser {\n  users {\n    email\n    id\n    full_name\n    phone_number\n    user_organizations {\n      organization {\n        id\n        name\n      }\n    }\n    phone_number\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateUser($id: uuid = \"\", $_set: users_set_input = {}) {\n  update_users_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n  }\n}"): (typeof documents)["mutation updateUser($id: uuid = \"\", $_set: users_set_input = {}) {\n  update_users_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createWallet($object: wallets_insert_input = {}) {\n  insert_wallets_one(object: $object) {\n    balance\n    created_at\n    id\n  }\n}"): (typeof documents)["mutation createWallet($object: wallets_insert_input = {}) {\n  insert_wallets_one(object: $object) {\n    balance\n    created_at\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation deductBalanceFromSecurity($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}"): (typeof documents)["mutation deductBalanceFromSecurity($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation deductBalanceFromWallet($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}"): (typeof documents)["mutation deductBalanceFromWallet($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query fetchUserWallet {\n  wallets {\n    balance\n    id\n    security_deposit\n    transactions {\n      ride_id\n      amount\n      ride {\n        end_time\n        start_time\n        total_cost\n        hub {\n          id\n          name\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query fetchUserWallet {\n  wallets {\n    balance\n    id\n    security_deposit\n    transactions {\n      ride_id\n      amount\n      ride {\n        end_time\n        start_time\n        total_cost\n        hub {\n          id\n          name\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateWalletBalance($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}"): (typeof documents)["mutation updateWalletBalance($id: uuid = \"\", $balance: numeric = \"\") {\n  update_wallets_by_pk(pk_columns: {id: $id}, _inc: {balance: $balance}) {\n    created_at\n    id\n    balance\n    org_id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateWalletSecurityDeposit($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}"): (typeof documents)["mutation updateWalletSecurityDeposit($security_deposit: numeric = \"\", $id: uuid = \"\") {\n  update_wallets_by_pk(\n    pk_columns: {id: $id}\n    _inc: {security_deposit: $security_deposit}\n  ) {\n    id\n    security_deposit\n    created_at\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;