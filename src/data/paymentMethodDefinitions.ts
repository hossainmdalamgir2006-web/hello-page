// Payment method definitions - HARDCODED in code
// Only configuration data (account_number, api_key, etc.) goes to database

export interface PaymentMethodDefinition {
  method_id: string;
  name: string;
  name_bn: string;
  icon: string;
  default_logo?: string;
  description: string;
  description_bn: string;
  type: "mobile" | "gateway" | "manual" | "custom";
  configFields: ConfigField[];
  instructions?: string;
  instructions_bn?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  label_bn: string;
  type: "text" | "password" | "select" | "image" | "switch" | "number" | "bank_accounts" | "textarea";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  dependsOn?: string; // Show this field only when dependsOn field equals a specific value
  dependsOnValue?: string; // If set, field shows when dependsOn field equals this value (default: truthy)
}

export interface BankAccount {
  id: string;
  bank_name: string;
  branch_name: string;
  account_name: string;
  account_number: string;
  routing_number?: string;
  swift_code?: string;
}

export const PAYMENT_METHOD_DEFINITIONS: PaymentMethodDefinition[] = [
  // ─── Mobile Payments ────────────────────────────────────────────────────────
  {
    method_id: "bkash",
    name: "bKash",
    name_bn: "bKash",
    icon: "📱",
    default_logo: "/logos/bkash.png?v=2",
    description: "Pay with bKash mobile wallet",
    description_bn: "Pay with bKash mobile wallet",
    type: "mobile",
    instructions: "Send payment to the bKash number shown and enter transaction ID",
    instructions_bn: "Pay to the displayed bKash number and provide the transaction ID",
    configFields: [
      {
        key: "payment_mode",
        label: "Payment Mode",
        label_bn: "Payment Mode",
        type: "select",
        options: [
          { value: "manual", label: "Manual (Customer submits Transaction ID)" },
          { value: "api", label: "API Gateway (Automatic redirect)" },
        ],
        required: true,
      },
      // Manual mode fields
      {
        key: "account_number",
        label: "bKash Account Number",
        label_bn: "bKash Account Number",
        type: "text",
        placeholder: "01XXXXXXXXX",
        required: true,
        dependsOn: "payment_mode",
        dependsOnValue: "manual",
      },
      {
        key: "account_type",
        label: "Account Type",
        label_bn: "Account Type",
        type: "select",
        options: [
          { value: "personal", label: "Personal" },
          { value: "agent", label: "Agent" },
          { value: "merchant", label: "Merchant" },
        ],
        dependsOn: "payment_mode",
        dependsOnValue: "manual",
      },
      {
        key: "qr_code_url",
        label: "Payment QR Code",
        label_bn: "Payment QR Code",
        type: "image",
        dependsOn: "payment_mode",
        dependsOnValue: "manual",
      },
      // API mode fields
      {
        key: "app_key",
        label: "App Key",
        label_bn: "App Key",
        type: "text",
        placeholder: "bKash App Key",
        required: true,
        dependsOn: "payment_mode",
        dependsOnValue: "api",
      },
      {
        key: "app_secret",
        label: "App Secret",
        label_bn: "App Secret",
        type: "password",
        required: true,
        dependsOn: "payment_mode",
        dependsOnValue: "api",
      },
      {
        key: "api_username",
        label: "API Username",
        label_bn: "API Username",
        type: "text",
        required: true,
        dependsOn: "payment_mode",
        dependsOnValue: "api",
      },
      {
        key: "api_password",
        label: "API Password",
        label_bn: "API Password",
        type: "password",
        required: true,
        dependsOn: "payment_mode",
        dependsOnValue: "api",
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "sandbox", label: "Sandbox (Test)" },
          { value: "live", label: "Live (Production)" },
        ],
        dependsOn: "payment_mode",
        dependsOnValue: "api",
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "nagad",
    name: "Nagad",
    name_bn: "Nagad",
    icon: "📱",
    default_logo: "/logos/nagad.png?v=2",
    description: "Pay with Nagad mobile wallet",
    description_bn: "Pay with Nagad mobile wallet",
    type: "mobile",
    instructions: "Send payment to the Nagad number shown and enter transaction ID",
    instructions_bn: "Pay to the displayed Nagad number and provide the transaction ID",
    configFields: [
      {
        key: "account_number",
        label: "Account Number",
        label_bn: "Account Number",
        type: "text",
        placeholder: "01XXXXXXXXX",
        required: true,
      },
      {
        key: "account_type",
        label: "Account Type",
        label_bn: "Account Type",
        type: "select",
        options: [
          { value: "personal", label: "Personal" },
          { value: "agent", label: "Agent" },
          { value: "merchant", label: "Merchant" },
        ],
        required: true,
      },
      {
        key: "qr_code_url",
        label: "Payment QR Code",
        label_bn: "Payment QR Code",
        type: "image",
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "rocket",
    name: "Rocket",
    name_bn: "Rocket",
    icon: "🚀",
    default_logo: "/logos/rocket.png?v=2",
    description: "Pay with Rocket (DBBL) mobile wallet",
    description_bn: "Pay with Rocket (Dutch-Bangla) mobile wallet",
    type: "mobile",
    instructions: "Send payment to the Rocket number shown and enter transaction ID",
    instructions_bn: "Pay to the displayed Rocket number and provide the transaction ID",
    configFields: [
      {
        key: "account_number",
        label: "Account Number",
        label_bn: "Account Number",
        type: "text",
        placeholder: "01XXXXXXXXX",
        required: true,
      },
      {
        key: "account_type",
        label: "Account Type",
        label_bn: "Account Type",
        type: "select",
        options: [
          { value: "personal", label: "Personal" },
          { value: "agent", label: "Agent" },
          { value: "merchant", label: "Merchant" },
        ],
        required: true,
      },
      {
        key: "qr_code_url",
        label: "Payment QR Code",
        label_bn: "Payment QR Code",
        type: "image",
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "upay",
    name: "Upay",
    name_bn: "Upay",
    icon: "💸",
    default_logo: "/logos/upay.png?v=2",
    description: "Pay with Upay mobile wallet",
    description_bn: "Pay with Upay mobile wallet",
    type: "mobile",
    instructions: "Send payment to the Upay number shown and enter transaction ID",
    instructions_bn: "Pay to the displayed Upay number and provide the transaction ID",
    configFields: [
      {
        key: "account_number",
        label: "Account Number",
        label_bn: "Account Number",
        type: "text",
        placeholder: "01XXXXXXXXX",
        required: true,
      },
      {
        key: "account_type",
        label: "Account Type",
        label_bn: "Account Type",
        type: "select",
        options: [
          { value: "personal", label: "Personal" },
          { value: "agent", label: "Agent" },
          { value: "merchant", label: "Merchant" },
        ],
        required: true,
      },
      {
        key: "qr_code_url",
        label: "Payment QR Code",
        label_bn: "Payment QR Code",
        type: "image",
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },

  // ─── Payment Gateways ────────────────────────────────────────────────────────
  {
    method_id: "sslcommerz",
    name: "SSLCommerz",
    name_bn: "SSLCommerz",
    icon: "💳",
    default_logo: "/logos/sslcommerz.png?v=2",
    description: "Pay with credit/debit card via SSLCommerz",
    description_bn: "Pay with credit/debit card via SSLCommerz",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Store ID / Merchant ID",
        label_bn: "Store ID / Merchant ID",
        type: "text",
        placeholder: "your_store_id",
        required: true,
      },
      {
        key: "api_key",
        label: "Store Password / API Key",
        label_bn: "Store Password / API Key",
        type: "password",
        required: true,
      },
      {
        key: "secret_key",
        label: "Secret Key",
        label_bn: "Secret Key",
        type: "password",
        required: true,
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "sandbox", label: "Sandbox (Test)" },
          { value: "live", label: "Live (Production)" },
        ],
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "shurjopay",
    name: "ShurjoPay",
    name_bn: "ShurjoPay",
    icon: "💳",
    default_logo: "/logos/shurjopay.png?v=2",
    description: "Pay via ShurjoPay payment gateway",
    description_bn: "Pay via ShurjoPay payment gateway",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Merchant Username",
        label_bn: "Merchant Username",
        type: "text",
        placeholder: "your_merchant_username",
        required: true,
      },
      {
        key: "api_key",
        label: "Merchant Key / Password",
        label_bn: "Merchant Key / Password",
        type: "password",
        required: true,
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "sandbox", label: "Sandbox (Test)" },
          { value: "live", label: "Live (Production)" },
        ],
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "aamarpay",
    name: "aamarPay",
    name_bn: "aamarPay",
    icon: "💳",
    default_logo: "/logos/aamarpay.png?v=2",
    description: "Pay with aamarPay payment gateway",
    description_bn: "Pay via aamarPay payment gateway",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Store ID",
        label_bn: "Store ID",
        type: "text",
        placeholder: "your_store_id",
        required: true,
      },
      {
        key: "api_key",
        label: "Signature Key",
        label_bn: "Signature Key",
        type: "password",
        required: true,
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "sandbox", label: "Sandbox (Test)" },
          { value: "live", label: "Live (Production)" },
        ],
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "stripe",
    name: "Stripe",
    name_bn: "Stripe",
    icon: "💳",
    default_logo: "/logos/stripe.png?v=2",
    description: "Pay with credit/debit card via Stripe",
    description_bn: "Pay with credit/debit card via Stripe",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Publishable Key",
        label_bn: "Publishable Key",
        type: "text",
        placeholder: "pk_live_...",
        required: true,
      },
      {
        key: "secret_key",
        label: "Secret Key",
        label_bn: "Secret Key",
        type: "password",
        placeholder: "sk_live_...",
        required: true,
      },
      {
        key: "api_key",
        label: "Webhook Secret",
        label_bn: "Webhook Secret",
        type: "password",
        placeholder: "whsec_...",
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "test", label: "Test Mode" },
          { value: "live", label: "Live (Production)" },
        ],
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "paypal",
    name: "PayPal",
    name_bn: "PayPal",
    icon: "🅿️",
    default_logo: "/logos/paypal.png?v=2",
    description: "Pay with PayPal",
    description_bn: "Pay with PayPal",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Client ID",
        label_bn: "Client ID",
        type: "text",
        placeholder: "your_client_id",
        required: true,
      },
      {
        key: "secret_key",
        label: "Client Secret",
        label_bn: "Client Secret",
        type: "password",
        required: true,
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "sandbox", label: "Sandbox (Test)" },
          { value: "live", label: "Live (Production)" },
        ],
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "2checkout",
    name: "2Checkout",
    name_bn: "2Checkout",
    icon: "💳",
    default_logo: "/logos/2checkout.png?v=2",
    description: "Pay via 2Checkout payment gateway",
    description_bn: "Pay via 2Checkout payment gateway",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Account Number / Seller ID",
        label_bn: "Account Number / Seller ID",
        type: "text",
        placeholder: "your_account_number",
        required: true,
      },
      {
        key: "secret_key",
        label: "Secret Key",
        label_bn: "Secret Key",
        type: "password",
        required: true,
      },
      {
        key: "test_mode",
        label: "Environment",
        label_bn: "Environment",
        type: "select",
        options: [
          { value: "sandbox", label: "Sandbox (Test)" },
          { value: "live", label: "Live (Production)" },
        ],
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "payoneer",
    name: "Payoneer",
    name_bn: "Payoneer",
    icon: "💳",
    default_logo: "/logos/payoneer.svg?v=2",
    description: "Pay with Payoneer card",
    description_bn: "Pay with Payoneer card",
    type: "gateway",
    configFields: [
      {
        key: "merchant_id",
        label: "Partner ID",
        label_bn: "Partner ID",
        type: "text",
        placeholder: "your_partner_id",
        required: true,
      },
      {
        key: "api_key",
        label: "API Username",
        label_bn: "API Username",
        type: "text",
        required: true,
      },
      {
        key: "secret_key",
        label: "API Password",
        label_bn: "API Password",
        type: "password",
        required: true,
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },

  // ─── Manual / Other Methods ───────────────────────────────────────────────────
  {
    method_id: "bank_transfer",
    name: "Bank Transfer",
    name_bn: "Bank Transfer",
    icon: "🏦",
    default_logo: "/logos/bank-transfer.png?v=2",
    description: "Pay via bank transfer (manual)",
    description_bn: "Pay via bank transfer",
    type: "manual",
    instructions: "Transfer to our bank account and enter transaction reference",
    instructions_bn: "Transfer to our bank account and provide the transaction reference",
    configFields: [
      {
        key: "bank_accounts",
        label: "Bank Accounts",
        label_bn: "Bank Accounts",
        type: "bank_accounts",
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "cheque",
    name: "Cheque Payment",
    name_bn: "Cheque Payment",
    icon: "🧾",
    default_logo: "/logos/cheque.png?v=2",
    description: "Pay by cheque deposit or transfer",
    description_bn: "Pay via cheque deposit or bank transfer",
    type: "manual",
    instructions: "Write a cheque payable to the account shown and deposit to the branch",
    instructions_bn: "Write the cheque to the displayed account and deposit at the branch",
    configFields: [
      {
        key: "payable_to",
        label: "Payable To (Name on Cheque)",
        label_bn: "Payable To (Name on Cheque)",
        type: "text",
        placeholder: "Company or Person Name",
        required: true,
      },
      {
        key: "bank_accounts",
        label: "Bank Accounts (Payee Accounts)",
        label_bn: "Bank Account (Payee Account)",
        type: "bank_accounts",
      },
      {
        key: "auto_processing_enabled",
        label: "Enable Auto Processing (Future Gateway Integration)",
        label_bn: "Enable Auto Processing (Future Gateway)",
        type: "switch",
      },
      {
        key: "instructions",
        label: "Custom Instructions for Customer",
        label_bn: "Instructions for Customer",
        type: "textarea",
        placeholder: "Write cheque payable to [Name]. Deposit at any branch of [Bank]...",
      },
      {
        key: "logo_url",
        label: "Custom Logo",
        label_bn: "Custom Logo",
        type: "image",
      },
    ],
  },
  {
    method_id: "cod",
    name: "Cash on Delivery",
    name_bn: "Cash on Delivery",
    icon: "💵",
    default_logo: "/logos/cod.png?v=2",
    description: "Pay when you receive your order",
    description_bn: "Pay when receiving the order",
    type: "manual",
    instructions: "Pay the delivery person when you receive your order",
    instructions_bn: "Pay the delivery person upon receiving the delivery",
    configFields: [
      {
        key: "cod_charge_enabled",
        label: "Enable COD Charge",
        label_bn: "COD Enable Charge",
        type: "switch",
      },
      {
        key: "cod_charge_type",
        label: "Charge Type",
        label_bn: "Charge Type",
        type: "select",
        options: [
          { value: "fixed", label: "Fixed Amount (BDT)" },
          { value: "percentage", label: "Percentage (%)" },
        ],
        dependsOn: "cod_charge_enabled",
      },
      {
        key: "cod_charge_value",
        label: "Charge Amount",
        label_bn: "Charge Amount",
        type: "number",
        placeholder: "0",
        dependsOn: "cod_charge_enabled",
      },
    ],
  },
];

// System method IDs that cannot be deleted
export const SYSTEM_METHOD_IDS = [
  "bkash", "nagad", "rocket", "upay",
  "sslcommerz", "shurjopay", "aamarpay", "stripe", "paypal", "2checkout", "payoneer",
  "bank_transfer", "cheque", "cod",
];

// Get definition by method_id
export function getPaymentMethodDefinition(methodId: string): PaymentMethodDefinition | undefined {
  return PAYMENT_METHOD_DEFINITIONS.find((d) => d.method_id === methodId);
}

// Get methods by type
export function getPaymentMethodsByType(type: PaymentMethodDefinition["type"]): PaymentMethodDefinition[] {
  return PAYMENT_METHOD_DEFINITIONS.filter((d) => d.type === type);
}
