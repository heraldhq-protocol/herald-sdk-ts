/**
 * Herald Privacy Registry IDL type definition.
 *
 * This provides the Anchor IDL type that the SDK uses to interact with
 * the on-chain program. Since we don't have a generated IDL JSON from
 * `anchor build`, this module exports the program metadata needed by
 * the Anchor Program class.
 */

/** Program IDL name. */
export const HERALD_IDL_NAME = 'herald_privacy_registry' as const;

/**
 * Minimal IDL structure for programmatic Anchor usage.
 * The SDK uses Anchor's `.methods` builder which needs account/instruction
 * names. Full IDL can be generated from `anchor build` when available.
 */
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
            "Identity PDA – created and owned by this program."
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
      "name": "renew_subscription",
      "docs": [
        "Renew (or initially activate) a protocol's monthly subscription.",
        "Called by the Herald backend after confirming off-chain payment."
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
    }
  ],
  "events": [
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
      "name": "SubscriptionExpiredEvent",
      "discriminator": [
        231,
        35,
        119,
        249,
        89,
        151,
        31,
        233
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
      "name": "SubscriptionExpired",
      "msg": "Protocol subscription has expired; renew to continue sending"
    },
    {
      "code": 6012,
      "name": "SubscriptionNotActive",
      "msg": "Protocol has not yet subscribed; subscription_expires_at is zero"
    },
    {
      "code": 6013,
      "name": "SendsLimitExceeded",
      "msg": "Protocol has reached the maximum sends for this billing period"
    },
    {
      "code": 6014,
      "name": "SendsOverflow",
      "msg": "Protocol sends counter would overflow"
    },
    {
      "code": 6015,
      "name": "InvalidSubscriptionExpiry",
      "msg": "New subscription expiry must be in the future"
    },
    {
      "code": 6016,
      "name": "ProtocolAlreadyActive",
      "msg": "Protocol is already active; no need to reactivate"
    },
    {
      "code": 6017,
      "name": "InvalidCategory",
      "msg": "Invalid category: must be 0 (DeFi), 1 (Governance), 2 (Marketing), or 3 (Other)"
    },
    {
      "code": 6018,
      "name": "InvalidRecipientHash",
      "msg": "Recipient hash must be exactly 32 bytes (SHA-256)"
    },
    {
      "code": 6019,
      "name": "InvalidNotificationId",
      "msg": "Notification ID must be exactly 16 bytes (UUID v4)"
    },
    {
      "code": 6020,
      "name": "LightCpiAccountsError",
      "msg": "Failed to initialise Light Protocol CPI accounts"
    },
    {
      "code": 6021,
      "name": "LightAccountError",
      "msg": "Failed to attach compressed account to Light CPI"
    },
    {
      "code": 6022,
      "name": "LightCpiInvocationError",
      "msg": "Light Protocol CPI invocation failed"
    },
    {
      "code": 6023,
      "name": "Overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6024,
      "name": "ClockUnavailable",
      "msg": "Clock sysvar unavailable"
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
      "name": "IdentityAccount",
      "docs": [
        "User identity account storing encrypted email and notification preferences.",
        "",
        "PDA Seeds: `[\"identity\", owner.key().as_ref()]`",
        "Space: 8 (discriminator) + fields ≈ 342 bytes; allocated 1024 for future expansion."
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
        "On-chain registration and subscription record for a DeFi protocol.",
        "",
        "PDA Seeds: `[\"protocol\", protocol_pubkey.as_ref()]`",
        "Allocated space: 256 bytes (8 discriminator + fields + padding)"
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
      "name": "SubscriptionExpiredEvent",
      "docs": [
        "Emitted when a subscription renewal is marked as overdue by Herald."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "expired_at",
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
      "name": "SubscriptionRenewed",
      "docs": [
        "Emitted when a protocol's subscription is renewed (by Herald authority)."
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
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
} as const;
