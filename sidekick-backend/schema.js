const schema = `
  scalar uuid
  scalar numeric
  scalar timestamp

  # Hasura filter operators
  input String_comparison_exp {
    _eq: String
    _ilike: String
  }

  input uuid_comparison_exp {
    _eq: uuid
  }

  input ride_step_enum_comparison_exp {
    _eq: ride_step_enum
  }

  input ride_steps_bool_exp {
    ride_step: ride_step_bool_exp
  }

  input ride_step_bool_exp {
    ride_steps: ride_step_fields_bool_exp
  }

  input ride_step_fields_bool_exp {
    steps: ride_step_enum_comparison_exp
  }

  # Query where filters
  input scooters_bool_exp {
    registration_number: String_comparison_exp
  }

  input ride_details_bool_exp {
    ride_steps: ride_steps_bool_exp
    user_id: uuid_comparison_exp
  }

  # Input payloads for mutations
  input users_set_input {
    full_name: String
    phone_number: String
    email: String
  }

  input ride_details_insert_input {
    user_id: uuid
    scooter_id: uuid
    start_hub_id: uuid
    end_hub_id: uuid
    start_time: timestamp
    end_time: timestamp
    total_cost: numeric
    total_distance: numeric
    cost_type: String
  }

  input wallets_insert_input {
    balance: numeric
    security_deposit: numeric
    org_id: uuid
  }

  enum ride_step_enum {
    RIDE_CREATED
    RIDE_ACTIVE
    RIDE_PAUSED
    RIDE_ENDED
  }

  # Primary entities matching Hasura types
  type Organization {
    id: uuid!
    name: String!
  }

  type UserOrganization {
    user_id: uuid!
    organization_id: uuid!
    organization: Organization!
  }

  type User {
    id: uuid!
    email: String!
    full_name: String!
    phone_number: String!
    user_organizations: [UserOrganization!]!
  }

  type Hub {
    id: uuid!
    name: String!
    latitude: Float!
    longitude: Float!
    organization_id: uuid!
    created_at: timestamp!
  }

  type Scooter {
    id: uuid!
    registration_number: String!
    status: String!
    is_active: Boolean!
    latitude: Float!
    longitude: Float!
    hub_id: uuid
  }

  type RideStep {
    id: uuid!
    ride_details_id: uuid!
    steps: ride_step_enum!
    created_at: timestamp!
  }

  type RideDetail {
    id: uuid!
    user_id: uuid!
    scooter_id: uuid!
    start_hub_id: uuid!
    end_hub_id: uuid
    start_time: timestamp!
    end_time: timestamp
    total_cost: Float
    total_distance: Float
    cost_type: String
    created_at: timestamp!
    ride_steps: [RideStep!]!
    hubByStartHubId: Hub
    hub: Hub
  }

  type Transaction {
    id: uuid!
    wallet_id: uuid!
    ride_id: uuid
    amount: Float!
    ride: RideDetail
  }

  type Wallet {
    id: uuid!
    balance: Float!
    security_deposit: Float!
    created_at: timestamp!
    org_id: uuid
    transactions: [Transaction!]!
  }

  # Primary Mutation Return Columns
  type update_users_mutation_response {
    id: uuid!
  }

  type update_ride_details_mutation_response {
    id: uuid!
    end_time: timestamp
    created_at: timestamp!
  }

  type update_wallets_mutation_response {
    id: uuid!
    balance: Float!
    security_deposit: Float!
    created_at: timestamp!
    org_id: uuid
  }

  # Root Schema definition
  type Query {
    organizations: [Organization!]!
    users: [User!]!
    hubs: [Hub!]!
    scooters(where: scooters_bool_exp): [Scooter!]!
    ride_details(where: ride_details_bool_exp): [RideDetail!]!
    wallets: [Wallet!]!
  }

  # Primary mutations matching primary keys and incremental mutations in SQLite
  input users_pk_columns_input {
    id: uuid!
  }

  input ride_details_pk_columns_input {
    id: uuid!
  }

  input wallets_pk_columns_input {
    id: uuid!
  }

  input wallets_inc_input {
    balance: numeric
    security_deposit: numeric
  }

  input ride_step_insert_input {
    steps: ride_step_enum
    ride_details_id: uuid
  }

  type Mutation {
    update_users_by_pk(
      pk_columns: users_pk_columns_input!
      _set: users_set_input!
    ): update_users_mutation_response

    insert_ride_details_one(
      object: ride_details_insert_input!
    ): RideDetail

    update_ride_details_by_pk(
      pk_columns: ride_details_pk_columns_input!
      _set: ride_details_insert_input!
    ): update_ride_details_mutation_response

    insert_ride_steps_one(
      object: ride_step_insert_input!
    ): RideStep

    insert_wallets_one(
      object: wallets_insert_input!
    ): Wallet

    update_wallets_by_pk(
      pk_columns: wallets_pk_columns_input!
      _inc: wallets_inc_input
    ): update_wallets_mutation_response
  }
`;

module.exports = schema;
