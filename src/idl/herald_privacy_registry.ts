/**
 * Herald Privacy Registry IDL type definition.
 *
 * Auto-generated from anchor build output.
 * Do not edit manually - run `anchor build` in herald-privacy-registry and copy.
 */
export const HERALD_IDL_NAME = 'herald_privacy_registry' as const;

export const HeraldIdl = {
  "address": "2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf",
  "metadata": {
    "name": "herald_privacy_registry",
    "version": "1.0.0",
    "spec": "0.1.0",
    "description": "Herald Privacy Registry – encrypted identity, protocol registry, and ZK delivery receipts"
  },
  "instructions": [
    {
      "name": "deactivate_protocol",
      "docs": [
        "Deactivate a protocol (soft deactivation). Only callable by the Herald authority."
      ],
      "discriminator": [
        72,
        138,
        91,
        107,
        75,
        27,
        252,
        191
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "protocol_account",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "delete_identity",
      "docs": [
        "Delete (close) a user identity account. Rent is refunded to the owner."
      ],
      "discriminator": [
        154,
        193,
        133,
        129,
        20,
        36,
        147,
        64
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "The wallet that owns this identity; receives rent refund."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "docs": [
            "Identity PDA – closed and rent returned to `owner`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "migrate_identity_channels",
      "docs": [
        "Lazy migration: set channel_email = true for pre-existing identities."
      ],
      "discriminator": [
        57,
        192,
        149,
        13,
        211,
        14,
        112,
        27
      ],
      "accounts": [
        {
          "name": "identity_account",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "migrate_notification_key_space",
      "docs": [
        "Migrate existing account to new size for notification key fields."
      ],
      "discriminator": [
        201,
        133,
        78,
        188,
        71,
        103,
        198,
        61
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "pay_subscription",
      "docs": [
        "Pay for subscription on-chain with USDC or USDT (Phase 2).",
        "Called directly by the protocol admin wallet."
      ],
      "discriminator": [
        214,
        139,
        186,
        253,
        169,
        248,
        196,
        11
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Protocol admin wallet — payer and authority."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol_account",
          "docs": [
            "Protocol registry account being renewed."
          ],
          "writable": true
        },
        {
          "name": "payment_mint",
          "docs": [
            "Payment token mint — must be USDC or USDT."
          ]
        },
        {
          "name": "payer_token_account",
          "docs": [
            "Payer's ATA for the payment token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "payment_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vault_token_account",
          "docs": [
            "Herald's vault ATA for the payment token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault_account"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "payment_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vault_account",
          "docs": [
            "Herald treasury vault PDA.",
            "TODO(#prod): Replace placeholder vault with real on-chain vault address before mainnet."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "months",
          "type": "u8"
        }
      ]
    },
    {
      "name": "reactivate_protocol",
      "docs": [
        "Reactivate a deactivated (non-suspended) protocol. Only callable by the Herald authority."
      ],
      "discriminator": [
        163,
        46,
        191,
        81,
        249,
        206,
        97,
        218
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "protocol_account",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "register_identity",
      "docs": [
        "Register a new user identity with encrypted email and notification preferences."
      ],
      "discriminator": [
        164,
        118,
        227,
        177,
        47,
        176,
        187,
        248
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "The wallet registering its identity; pays rent."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "docs": [
            "Identity PDA – created and owned by this program.",
            "Uses IdentityAccount::SPACE to accommodate all channel fields."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "encrypted_email",
          "type": "bytes"
        },
        {
          "name": "email_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce",
          "type": {
            "array": [
              "u8",
              24
            ]
          }
        },
        {
          "name": "opt_in_all",
          "type": "bool"
        },
        {
          "name": "opt_in_defi",
          "type": "bool"
        },
        {
          "name": "opt_in_governance",
          "type": "bool"
        },
        {
          "name": "opt_in_marketing",
          "type": "bool"
        },
        {
          "name": "digest_mode",
          "type": "bool"
        }
      ]
    },
    {
      "name": "register_notification_key",
      "docs": [
        "Register a sealed X25519 notification key on an existing identity.",
        "The sealed blob is only decryptable by the Herald Nitro Enclave."
      ],
      "discriminator": [
        50,
        219,
        164,
        245,
        109,
        69,
        75,
        173
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "sealed_x25519_pubkey",
          "type": {
            "array": [
              "u8",
              48
            ]
          }
        },
        {
          "name": "sender_x25519_pubkey",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce",
          "type": {
            "array": [
              "u8",
              24
            ]
          }
        },
        {
          "name": "version",
          "type": "u8"
        }
      ]
    },
    {
      "name": "register_protocol",
      "docs": [
        "Register a new DeFi protocol. Only callable by the Herald authority."
      ],
      "discriminator": [
        63,
        107,
        156,
        136,
        249,
        231,
        183,
        65
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Herald backend authority – pays rent and must match `HERALD_AUTHORITY`."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol_account",
          "docs": [
            "Protocol registry PDA – seeded by the protocol's wallet address."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "protocol_pubkey"
              }
            ]
          }
        },
        {
          "name": "protocol_pubkey",
          "docs": [
            "The protocol's wallet address (not required to sign)."
          ]
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "tier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "register_sms",
      "docs": [
        "Register or update the SMS channel for an existing identity."
      ],
      "discriminator": [
        74,
        169,
        36,
        29,
        68,
        41,
        235,
        126
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "encrypted_phone",
          "type": "bytes"
        },
        {
          "name": "phone_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce_sms",
          "type": {
            "array": [
              "u8",
              24
            ]
          }
        }
      ]
    },
    {
      "name": "register_telegram",
      "docs": [
        "Register or update the Telegram channel for an existing identity."
      ],
      "discriminator": [
        58,
        196,
        66,
        237,
        60,
        81,
        82,
        248
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "encrypted_telegram_id",
          "type": "bytes"
        },
        {
          "name": "telegram_id_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce_telegram",
          "type": {
            "array": [
              "u8",
              24
            ]
          }
        }
      ]
    },
    {
      "name": "remove_channel",
      "docs": [
        "Permanently remove a channel's encrypted data (GDPR per-channel erasure)."
      ],
      "discriminator": [
        92,
        5,
        181,
        70,
        37,
        206,
        219,
        19
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "channel",
          "type": {
            "defined": {
              "name": "ChannelType"
            }
          }
        }
      ]
    },
    {
      "name": "renew_subscription",
      "docs": [
        "Renew (or initially activate) a protocol's monthly subscription.",
        "Called by the Herald backend after confirming off-chain payment (Helio)."
      ],
      "discriminator": [
        45,
        75,
        154,
        194,
        160,
        10,
        111,
        183
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "protocol_account",
          "docs": [
            "The protocol whose subscription is being renewed.",
            "Marked `mut` – we update billing timestamps and the active flag."
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "reset_protocol_sends",
      "docs": [
        "Reset a protocol's sends counter at the end of a billing period."
      ],
      "discriminator": [
        58,
        194,
        230,
        54,
        122,
        247,
        39,
        216
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "protocol_account",
          "docs": [
            "The protocol to reset. The authority constraint ensures this is",
            "a legitimate Herald-owned operation. No additional constraint is",
            "needed on the protocol account itself beyond that it exists."
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "revoke_notification_key",
      "docs": [
        "Revoke (zero out) a notification key. Identity data remains intact."
      ],
      "discriminator": [
        83,
        159,
        197,
        39,
        253,
        247,
        210,
        84
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "rotate_notification_key",
      "docs": [
        "Rotate an existing notification key. Increments rotation counter."
      ],
      "discriminator": [
        17,
        178,
        55,
        121,
        31,
        32,
        163,
        40
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "new_sealed_x25519_pubkey",
          "type": {
            "array": [
              "u8",
              48
            ]
          }
        },
        {
          "name": "new_sender_x25519_pubkey",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "new_nonce",
          "type": {
            "array": [
              "u8",
              24
            ]
          }
        },
        {
          "name": "version",
          "type": "u8"
        }
      ]
    },
    {
      "name": "suspend_protocol",
      "docs": [
        "Hard-suspend a protocol (e.g. ToS violation). Only callable by the Herald authority."
      ],
      "discriminator": [
        75,
        109,
        6,
        78,
        243,
        239,
        250,
        137
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "protocol_account",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "update_channel_settings",
      "docs": [
        "Toggle individual channels on/off without modifying encrypted data."
      ],
      "discriminator": [
        149,
        67,
        63,
        108,
        132,
        122,
        95,
        128
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "identity_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "channel_email",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "channel_telegram",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "channel_sms",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "update_identity",
      "docs": [
        "Partially update an existing user identity."
      ],
      "discriminator": [
        130,
        54,
        88,
        104,
        222,
        124,
        238,
        252
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "The wallet that owns this identity; must be a signer."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "identity_account",
          "docs": [
            "Existing identity PDA – only the owner can mutate it."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "encrypted_email",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "email_hash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "option": {
              "array": [
                "u8",
                24
              ]
            }
          }
        },
        {
          "name": "opt_in_all",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "opt_in_defi",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "opt_in_governance",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "opt_in_marketing",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "digest_mode",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "update_protocol_tier",
      "docs": [
        "Update a protocol's tier level. Only callable by the Herald authority."
      ],
      "discriminator": [
        215,
        12,
        211,
        175,
        183,
        69,
        163,
        183
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "protocol_account",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "new_tier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdraw_treasury",
      "docs": [
        "Withdraw accumulated USDC/USDT from vault to Herald treasury.",
        "Only callable by the Herald authority."
      ],
      "discriminator": [
        40,
        63,
        122,
        158,
        144,
        216,
        83,
        96
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Herald backend authority — must match `HERALD_AUTHORITY`."
          ],
          "signer": true
        },
        {
          "name": "vault_account",
          "docs": [
            "Herald treasury vault PDA (used as signer via seeds)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vault_token_account",
          "docs": [
            "Vault's token account (source of withdrawal)."
          ],
          "writable": true
        },
        {
          "name": "treasury_token_account",
          "docs": [
            "Treasury's token account (destination).",
            "Constrained to the known HERALD_TREASURY address."
          ],
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "write_receipt",
      "docs": [
        "Write a ZK-compressed delivery receipt via Light Protocol CPI."
      ],
      "discriminator": [
        209,
        10,
        117,
        157,
        52,
        82,
        248,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Herald backend authority – pays for the compressed account write."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol_account",
          "docs": [
            "The protocol that triggered this notification.",
            "Must be active, not suspended, and within subscription/tier limits.",
            "Marked `mut` so the sends counter can be incremented."
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "proof",
          "type": {
            "defined": {
              "name": "AnchorCompressedProof"
            }
          }
        },
        {
          "name": "output_tree_index",
          "type": "u8"
        },
        {
          "name": "recipient_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "notification_id",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "category",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "IdentityAccount",
      "discriminator": [
        194,
        90,
        181,
        160,
        182,
        206,
        116,
        158
      ]
    },
    {
      "name": "ProtocolRegistryAccount",
      "discriminator": [
        228,
        240,
        17,
        31,
        5,
        151,
        23,
        217
      ]
    },
    {
      "name": "SubscriptionVaultAccount",
      "discriminator": [
        70,
        34,
        53,
        61,
        174,
        49,
        61,
        47
      ]
    }
  ],
  "events": [
    {
      "name": "ChannelRemoved",
      "discriminator": [
        226,
        140,
        18,
        241,
        0,
        35,
        140,
        52
      ]
    },
    {
      "name": "ChannelSettingsUpdated",
      "discriminator": [
        185,
        148,
        116,
        148,
        198,
        14,
        231,
        155
      ]
    },
    {
      "name": "IdentityDeleted",
      "discriminator": [
        44,
        0,
        224,
        163,
        94,
        45,
        107,
        91
      ]
    },
    {
      "name": "IdentityRegistered",
      "discriminator": [
        5,
        243,
        147,
        84,
        8,
        116,
        238,
        24
      ]
    },
    {
      "name": "IdentityUpdated",
      "discriminator": [
        93,
        70,
        231,
        144,
        0,
        172,
        155,
        159
      ]
    },
    {
      "name": "NotificationDelivered",
      "discriminator": [
        178,
        168,
        21,
        34,
        150,
        115,
        133,
        127
      ]
    },
    {
      "name": "NotificationKeyRegistered",
      "discriminator": [
        142,
        89,
        128,
        116,
        174,
        19,
        200,
        201
      ]
    },
    {
      "name": "NotificationKeyRevoked",
      "discriminator": [
        7,
        155,
        84,
        65,
        251,
        27,
        17,
        173
      ]
    },
    {
      "name": "NotificationKeyRotated",
      "discriminator": [
        8,
        99,
        153,
        174,
        178,
        115,
        27,
        156
      ]
    },
    {
      "name": "PaymentReceived",
      "discriminator": [
        238,
        145,
        50,
        71,
        36,
        83,
        130,
        215
      ]
    },
    {
      "name": "PeriodReset",
      "discriminator": [
        198,
        246,
        135,
        48,
        101,
        134,
        72,
        246
      ]
    },
    {
      "name": "PreferencesUpdated",
      "discriminator": [
        157,
        193,
        191,
        193,
        56,
        255,
        40,
        131
      ]
    },
    {
      "name": "ProtocolDeactivated",
      "discriminator": [
        155,
        195,
        139,
        194,
        98,
        194,
        147,
        207
      ]
    },
    {
      "name": "ProtocolReactivated",
      "discriminator": [
        28,
        237,
        233,
        131,
        203,
        159,
        72,
        190
      ]
    },
    {
      "name": "ProtocolRegistered",
      "discriminator": [
        68,
        113,
        160,
        1,
        146,
        198,
        22,
        87
      ]
    },
    {
      "name": "ProtocolSendRecorded",
      "discriminator": [
        234,
        94,
        230,
        20,
        203,
        60,
        191,
        235
      ]
    },
    {
      "name": "ProtocolSuspended",
      "discriminator": [
        196,
        103,
        239,
        112,
        32,
        247,
        152,
        72
      ]
    },
    {
      "name": "ProtocolTierUpdated",
      "discriminator": [
        240,
        116,
        237,
        184,
        121,
        197,
        137,
        71
      ]
    },
    {
      "name": "SmsRegistered",
      "discriminator": [
        145,
        36,
        206,
        101,
        82,
        239,
        24,
        169
      ]
    },
    {
      "name": "SubscriptionRenewed",
      "discriminator": [
        107,
        68,
        229,
        211,
        63,
        57,
        134,
        149
      ]
    },
    {
      "name": "TelegramRegistered",
      "discriminator": [
        135,
        16,
        238,
        229,
        215,
        59,
        170,
        162
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmailTooLong",
      "msg": "Encrypted email exceeds maximum length of 200 bytes"
    },
    {
      "code": 6001,
      "name": "EmailEmpty",
      "msg": "Encrypted email must not be empty"
    },
    {
      "code": 6002,
      "name": "InvalidEmailHash",
      "msg": "Email hash must be exactly 32 bytes (SHA-256)"
    },
    {
      "code": 6003,
      "name": "InvalidNonce",
      "msg": "Nonce must be exactly 24 bytes"
    },
    {
      "code": 6004,
      "name": "EmptyUpdate",
      "msg": "Update must modify at least one field"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Unauthorized: signer does not match required authority"
    },
    {
      "code": 6006,
      "name": "OwnerMismatch",
      "msg": "Unauthorized: signer does not own this identity account"
    },
    {
      "code": 6007,
      "name": "InvalidTier",
      "msg": "Invalid tier: must be 0 (dev), 1 (growth), 2 (scale), or 3 (enterprise)"
    },
    {
      "code": 6008,
      "name": "ProtocolInactive",
      "msg": "Protocol is not active"
    },
    {
      "code": 6009,
      "name": "ProtocolAlreadyDeactivated",
      "msg": "Protocol is already deactivated"
    },
    {
      "code": 6010,
      "name": "ProtocolSuspended",
      "msg": "Protocol has been suspended by Herald and cannot send notifications"
    },
    {
      "code": 6011,
      "name": "ProtocolAlreadyActive",
      "msg": "Protocol is already active; no need to reactivate"
    },
    {
      "code": 6012,
      "name": "SubscriptionExpired",
      "msg": "Protocol subscription has expired; renew to continue sending"
    },
    {
      "code": 6013,
      "name": "SubscriptionNotActive",
      "msg": "Protocol has not yet subscribed; subscription_expires_at is zero"
    },
    {
      "code": 6014,
      "name": "SendsLimitExceeded",
      "msg": "Protocol has reached the maximum sends for this billing period"
    },
    {
      "code": 6015,
      "name": "SendsOverflow",
      "msg": "Protocol sends counter would overflow"
    },
    {
      "code": 6016,
      "name": "InvalidSubscriptionExpiry",
      "msg": "New subscription expiry must be in the future"
    },
    {
      "code": 6017,
      "name": "DevTierNoPayment",
      "msg": "Developer tier is free; payment not required"
    },
    {
      "code": 6018,
      "name": "UnsupportedPaymentToken",
      "msg": "Unsupported payment token; must be USDC or USDT"
    },
    {
      "code": 6019,
      "name": "InvalidCategory",
      "msg": "Invalid category: must be 0 (DeFi), 1 (Governance), 2 (Marketing), or 3 (Other)"
    },
    {
      "code": 6020,
      "name": "InvalidRecipientHash",
      "msg": "Recipient hash must be exactly 32 bytes (SHA-256)"
    },
    {
      "code": 6021,
      "name": "InvalidNotificationId",
      "msg": "Notification ID must be exactly 16 bytes (UUID v4)"
    },
    {
      "code": 6022,
      "name": "LightCpiAccountsError",
      "msg": "Failed to initialise Light Protocol CPI accounts"
    },
    {
      "code": 6023,
      "name": "LightAccountError",
      "msg": "Failed to attach compressed account to Light CPI"
    },
    {
      "code": 6024,
      "name": "LightCpiInvocationError",
      "msg": "Light Protocol CPI invocation failed"
    },
    {
      "code": 6025,
      "name": "Overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6026,
      "name": "ClockUnavailable",
      "msg": "Clock sysvar unavailable"
    },
    {
      "code": 6027,
      "name": "TelegramIdEmpty",
      "msg": "Encrypted Telegram ID must not be empty"
    },
    {
      "code": 6028,
      "name": "TelegramIdTooLong",
      "msg": "Encrypted Telegram ID exceeds maximum length of 80 bytes"
    },
    {
      "code": 6029,
      "name": "TelegramNotRegistered",
      "msg": "Telegram channel not registered; add Telegram before enabling it"
    },
    {
      "code": 6030,
      "name": "PhoneEmpty",
      "msg": "Encrypted phone number must not be empty"
    },
    {
      "code": 6031,
      "name": "PhoneTooLong",
      "msg": "Encrypted phone number exceeds maximum length of 65 bytes"
    },
    {
      "code": 6032,
      "name": "SmsNotRegistered",
      "msg": "SMS channel not registered; add phone before enabling it"
    },
    {
      "code": 6033,
      "name": "NoActiveChannels",
      "msg": "At least one delivery channel must remain active"
    },
    {
      "code": 6034,
      "name": "InvalidChannelType",
      "msg": "Invalid channel type: must be 0 (Telegram) or 1 (SMS)"
    },
    {
      "code": 6035,
      "name": "ZeroSealedPubkey",
      "msg": "Sealed pubkey cannot be all zeros — invalid key material"
    },
    {
      "code": 6036,
      "name": "ZeroNotificationNonce",
      "msg": "Notification nonce cannot be all zeros — replay attack risk"
    },
    {
      "code": 6037,
      "name": "UnsupportedNotificationKeyVersion",
      "msg": "Unsupported notification key version"
    },
    {
      "code": 6038,
      "name": "MaxNotificationKeyRotationsExceeded",
      "msg": "Max notification key rotations reached — revoke and re-register"
    },
    {
      "code": 6039,
      "name": "NotificationNonceReuse",
      "msg": "Notification nonce must differ from current nonce on rotation"
    },
    {
      "code": 6040,
      "name": "NotificationKeyNotRegistered",
      "msg": "No notification key registered — cannot rotate or revoke"
    },
    {
      "code": 6041,
      "name": "IdentityNotRegistered",
      "msg": "Identity account must be registered before adding a notification key"
    }
  ],
  "types": [
    {
      "name": "AnchorCompressedProof",
      "docs": [
        "Anchor-compatible wrapper for `CompressedProof`.",
        "",
        "`light_sdk::instruction::CompressedProof` only derives `BorshSerialize` /",
        "`BorshDeserialize`, which are incompatible with Anchor's `#[program]` macro.",
        "This struct mirrors the same fields and derives `AnchorSerialize` /",
        "`AnchorDeserialize` so it can be used as an instruction parameter."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ChannelRemoved",
      "docs": [
        "Emitted when a channel's encrypted data is permanently removed (GDPR erasure)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "channel",
            "docs": [
              "0 = Telegram, 1 = SMS"
            ],
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ChannelSettingsUpdated",
      "docs": [
        "Emitted when channel enable/disable flags are toggled."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "channel_email",
            "type": "bool"
          },
          {
            "name": "channel_telegram",
            "type": "bool"
          },
          {
            "name": "channel_sms",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ChannelType",
      "docs": [
        "Channel type enum for per-channel removal (GDPR erasure)."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Telegram"
          },
          {
            "name": "Sms"
          }
        ]
      }
    },
    {
      "name": "IdentityAccount",
      "docs": [
        "User identity account storing encrypted email, channel data, and notification preferences.",
        "",
        "PDA Seeds: `[\"identity\", owner.key().as_ref()]`",
        "",
        "BACKWARD COMPATIBILITY:",
        "The existing fields are unchanged. New channel fields are appended.",
        "Programs using InitSpace will auto-include new fields in space calculation.",
        "",
        "PRIVACY INVARIANT:",
        "ALL channel identifiers are stored as NaCl box ciphertext.",
        "The pattern is identical for every channel:",
        "[ephemeral_pubkey (32 bytes) || nacl_box_ciphertext]",
        "Herald's Nitro Enclave decrypts using the wallet owner's X25519 key."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The wallet that owns this identity."
            ],
            "type": "pubkey"
          },
          {
            "name": "encrypted_email",
            "docs": [
              "NaCl-encrypted email address (max 200 bytes)."
            ],
            "type": "bytes"
          },
          {
            "name": "email_hash",
            "docs": [
              "SHA-256 hash of the plaintext email (for change detection without decryption)."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce",
            "docs": [
              "NaCl encryption nonce."
            ],
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          },
          {
            "name": "registered_at",
            "docs": [
              "Unix timestamp of initial registration."
            ],
            "type": "i64"
          },
          {
            "name": "opt_in_all",
            "docs": [
              "Global opt-in for all notification categories."
            ],
            "type": "bool"
          },
          {
            "name": "opt_in_defi",
            "docs": [
              "Opt-in for DeFi notifications."
            ],
            "type": "bool"
          },
          {
            "name": "opt_in_governance",
            "docs": [
              "Opt-in for governance notifications."
            ],
            "type": "bool"
          },
          {
            "name": "opt_in_marketing",
            "docs": [
              "Opt-in for marketing notifications."
            ],
            "type": "bool"
          },
          {
            "name": "digest_mode",
            "docs": [
              "When true, deliver notifications in a daily digest instead of real-time."
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          },
          {
            "name": "channel_email",
            "docs": [
              "Email channel enabled (default true — all existing accounts)."
            ],
            "type": "bool"
          },
          {
            "name": "channel_telegram",
            "docs": [
              "Telegram channel enabled."
            ],
            "type": "bool"
          },
          {
            "name": "channel_sms",
            "docs": [
              "SMS channel enabled."
            ],
            "type": "bool"
          },
          {
            "name": "encrypted_telegram_id",
            "docs": [
              "NaCl box encrypted Telegram chat_id (int64 as string).",
              "Format: [ephemeral_pubkey(32) || box(chat_id_str, nonce_tg)].",
              "Empty Vec = not registered.",
              "Max 80 bytes: 32 ephemeral + ~16 overhead + max 10 char chat_id."
            ],
            "type": "bytes"
          },
          {
            "name": "telegram_id_hash",
            "docs": [
              "SHA-256 of the Telegram chat_id string.",
              "Allows Herald to detect chat_id changes without decrypting."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce_telegram",
            "docs": [
              "NaCl nonce for Telegram encryption (separate from email nonce)."
            ],
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          },
          {
            "name": "encrypted_phone",
            "docs": [
              "NaCl box encrypted E.164 phone number (e.g. \"+14155552671\").",
              "Format: [ephemeral_pubkey(32) || box(phone_e164, nonce_sms)].",
              "Empty Vec = not registered.",
              "Max 65 bytes: 32 ephemeral + ~16 overhead + max 15 char E.164."
            ],
            "type": "bytes"
          },
          {
            "name": "phone_hash",
            "docs": [
              "SHA-256 of the E.164 phone number string."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce_sms",
            "docs": [
              "NaCl nonce for phone encryption."
            ],
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          },
          {
            "name": "sealed_x25519_pubkey",
            "docs": [
              "NaCl box ciphertext of user's X25519 pubkey.",
              "Sealed with Herald Enclave's wrapping pubkey. Only the enclave can unwrap.",
              "48 bytes = 32 (plaintext X25519 pub) + 16 (Poly1305 MAC).",
              "All zeros = not registered."
            ],
            "type": {
              "array": [
                "u8",
                48
              ]
            }
          },
          {
            "name": "sender_x25519_pubkey",
            "docs": [
              "User's X25519 public key in plaintext.",
              "Needed by the enclave for NaCl box.open (as the \"sender\" pubkey).",
              "Safe to store unencrypted — it reveals nothing about notification content."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "notification_nonce",
            "docs": [
              "NaCl box nonce used during sealing. Stored so the enclave can unwrap."
            ],
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          },
          {
            "name": "notification_key_version",
            "docs": [
              "Schema version for the notification key format.",
              "Allows the enclave to handle format migrations gracefully."
            ],
            "type": "u8"
          },
          {
            "name": "notification_key_updated_at",
            "docs": [
              "Unix timestamp of last notification key registration or rotation."
            ],
            "type": "i64"
          },
          {
            "name": "notification_key_rotation_count",
            "docs": [
              "Number of times this notification key has been rotated.",
              "Capped at MAX_NOTIFICATION_KEY_ROTATIONS to prevent abuse."
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "IdentityDeleted",
      "docs": [
        "Emitted when a user deletes their identity account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "IdentityRegistered",
      "docs": [
        "Emitted when a new user identity is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "email_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "opt_in_all",
            "type": "bool"
          },
          {
            "name": "opt_in_defi",
            "type": "bool"
          },
          {
            "name": "opt_in_governance",
            "type": "bool"
          },
          {
            "name": "opt_in_marketing",
            "type": "bool"
          },
          {
            "name": "digest_mode",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "IdentityUpdated",
      "docs": [
        "Emitted when a user updates their identity."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "email_changed",
            "type": "bool"
          },
          {
            "name": "preferences_changed",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "NotificationDelivered",
      "docs": [
        "Emitted when a ZK-compressed delivery receipt is written."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "recipient_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "notification_id",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "category",
            "type": "u8"
          },
          {
            "name": "sends_this_period",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "NotificationKeyRegistered",
      "docs": [
        "Emitted when a user registers their sealed X25519 notification key."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "registered_at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "NotificationKeyRevoked",
      "docs": [
        "Emitted when a user revokes (zeroes out) their notification key."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "revoked_at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "NotificationKeyRotated",
      "docs": [
        "Emitted when a user rotates their sealed notification key."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "rotation_count",
            "type": "u32"
          },
          {
            "name": "rotated_at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "PaymentReceived",
      "docs": [
        "Emitted when a protocol pays on-chain (Phase 2 only)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "amount_usdc",
            "type": "u64"
          },
          {
            "name": "token_mint",
            "type": "pubkey"
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "months",
            "type": "u8"
          },
          {
            "name": "new_expiry",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "PeriodReset",
      "docs": [
        "Emitted at the end of a billing period when the sends counter is reset."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "sends_last_period",
            "type": "u64"
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "PreferencesUpdated",
      "docs": [
        "Emitted when notification preferences specifically change."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "opt_in_all",
            "type": "bool"
          },
          {
            "name": "opt_in_defi",
            "type": "bool"
          },
          {
            "name": "opt_in_governance",
            "type": "bool"
          },
          {
            "name": "opt_in_marketing",
            "type": "bool"
          },
          {
            "name": "digest_mode",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ProtocolDeactivated",
      "docs": [
        "Emitted when a protocol is deactivated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ProtocolReactivated",
      "docs": [
        "Emitted when a previously deactivated protocol is reactivated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ProtocolRegistered",
      "docs": [
        "Emitted when a new DeFi protocol is registered."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "name_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ProtocolRegistryAccount",
      "docs": [
        "On-chain registration and billing record for a DeFi protocol.",
        "",
        "PDA Seeds: `[\"protocol\", protocol_pubkey.as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Protocol admin wallet address (the protocol's on-chain identity)."
            ],
            "type": "pubkey"
          },
          {
            "name": "name_hash",
            "docs": [
              "SHA-256 hash of the protocol name (actual name stored off-chain)."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "tier",
            "docs": [
              "Tier level: 0=dev, 1=growth, 2=scale, 3=enterprise."
            ],
            "type": "u8"
          },
          {
            "name": "subscription_expires_at",
            "docs": [
              "Unix timestamp when the current subscription period expires.",
              "0 means not yet active (registered but not yet subscribed)."
            ],
            "type": "i64"
          },
          {
            "name": "last_renewed_at",
            "docs": [
              "Unix timestamp of the last subscription renewal."
            ],
            "type": "i64"
          },
          {
            "name": "periods_paid",
            "docs": [
              "Total number of complete billing periods successfully paid."
            ],
            "type": "u32"
          },
          {
            "name": "sends_this_period",
            "docs": [
              "Number of sends consumed in the current billing period."
            ],
            "type": "u64"
          },
          {
            "name": "is_active",
            "docs": [
              "Whether this protocol is allowed to send notifications.",
              "Set to false on deactivation or subscription lapse."
            ],
            "type": "bool"
          },
          {
            "name": "is_suspended",
            "docs": [
              "Whether the protocol has been explicitly suspended by Herald (not just lapsed)."
            ],
            "type": "bool"
          },
          {
            "name": "lifetime_usdc_paid",
            "docs": [
              "Accumulated USDC paid lifetime (6-decimal base units, for analytics)."
            ],
            "type": "u64"
          },
          {
            "name": "last_payment_mint",
            "docs": [
              "Last payment token mint (USDC or USDT pubkey). Default if never paid."
            ],
            "type": "pubkey"
          },
          {
            "name": "registered_at",
            "docs": [
              "Unix timestamp of initial registration."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProtocolSendRecorded",
      "docs": [
        "Emitted on every send so off-chain indexers can track usage."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "sends_this_period",
            "type": "u64"
          },
          {
            "name": "sends_limit",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ProtocolSuspended",
      "docs": [
        "Emitted when a protocol is suspended by Herald."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ProtocolTierUpdated",
      "docs": [
        "Emitted when a protocol's tier is changed."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "old_tier",
            "type": "u8"
          },
          {
            "name": "new_tier",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "SmsRegistered",
      "docs": [
        "Emitted when an SMS channel is registered or updated for an identity."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "phone_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "SubscriptionRenewed",
      "docs": [
        "Emitted by BOTH `renew_subscription` (Helio path) AND `pay_subscription` (USDC path)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "new_expiry",
            "type": "i64"
          },
          {
            "name": "periods_paid",
            "type": "u32"
          },
          {
            "name": "usdc_paid",
            "docs": [
              "Zero when called via authority (Helio); actual USDC amount for on-chain payments."
            ],
            "type": "u64"
          },
          {
            "name": "payment_source",
            "docs": [
              "\"helio_webhook\" | \"on_chain_usdc\" | \"on_chain_usdt\" (padded to 20 bytes)."
            ],
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "SubscriptionVaultAccount",
      "docs": [
        "Herald's USDC/USDT treasury vault.",
        "",
        "PDA Seeds: `[\"vault\"]`",
        "Holds accumulated subscription payments.",
        "Only withdrawable by HERALD_AUTHORITY to HERALD_TREASURY."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Herald treasury authority (Squads 2-of-3 multisig)."
            ],
            "type": "pubkey"
          },
          {
            "name": "total_usdc_collected",
            "docs": [
              "Total USDC accumulated (6-decimal base units)."
            ],
            "type": "u64"
          },
          {
            "name": "total_usdt_collected",
            "docs": [
              "Total USDT accumulated (6-decimal base units)."
            ],
            "type": "u64"
          },
          {
            "name": "last_withdrawal_at",
            "docs": [
              "Last withdrawal timestamp."
            ],
            "type": "i64"
          },
          {
            "name": "withdrawal_count",
            "docs": [
              "Total withdrawal count (for audit trail)."
            ],
            "type": "u32"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "TelegramRegistered",
      "docs": [
        "Emitted when a Telegram channel is registered or updated for an identity."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "telegram_id_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};