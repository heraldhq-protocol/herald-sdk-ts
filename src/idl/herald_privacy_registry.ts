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
    "name": "heraldPrivacyRegistry",
    "version": "1.0.0",
    "spec": "0.1.0",
    "description": "Herald Privacy Registry – encrypted identity, protocol registry, and ZK delivery receipts"
  },
  "instructions": [
    {
      "name": "deactivateProtocol",
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
          "name": "protocolAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "deleteIdentity",
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
          "name": "identityAccount",
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
      "name": "paySubscription",
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
          "name": "protocolAccount",
          "docs": [
            "Protocol registry account being renewed."
          ],
          "writable": true
        },
        {
          "name": "paymentMint",
          "docs": [
            "Payment token mint — must be USDC or USDT."
          ]
        },
        {
          "name": "payerTokenAccount",
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
                "path": "paymentMint"
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
          "name": "vaultTokenAccount",
          "docs": [
            "Herald's vault ATA for the payment token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultAccount"
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
                "path": "paymentMint"
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
          "name": "vaultAccount",
          "docs": [
            "Herald treasury vault PDA."
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
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
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
      "name": "reactivateProtocol",
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
          "name": "protocolAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "registerIdentity",
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
          "name": "identityAccount",
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "encryptedEmail",
          "type": "bytes"
        },
        {
          "name": "emailHash",
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
          "name": "optInAll",
          "type": "bool"
        },
        {
          "name": "optInDefi",
          "type": "bool"
        },
        {
          "name": "optInGovernance",
          "type": "bool"
        },
        {
          "name": "optInMarketing",
          "type": "bool"
        },
        {
          "name": "digestMode",
          "type": "bool"
        }
      ]
    },
    {
      "name": "registerProtocol",
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
          "name": "protocolAccount",
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
                "path": "protocolPubkey"
              }
            ]
          }
        },
        {
          "name": "protocolPubkey",
          "docs": [
            "The protocol's wallet address (not required to sign)."
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nameHash",
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
      "name": "renewSubscription",
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
          "name": "protocolAccount",
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
      "name": "resetProtocolSends",
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
          "name": "protocolAccount",
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
      "name": "suspendProtocol",
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
          "name": "protocolAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "updateIdentity",
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
          "name": "identityAccount",
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
          "name": "encryptedEmail",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "emailHash",
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
          "name": "optInAll",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "optInDefi",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "optInGovernance",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "optInMarketing",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "digestMode",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "updateProtocolTier",
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
          "name": "protocolAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newTier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawTreasury",
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
          "name": "vaultAccount",
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
          "name": "vaultTokenAccount",
          "docs": [
            "Vault's token account (source of withdrawal)."
          ],
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury's token account (destination).",
            "Constrained to the known HERALD_TREASURY address."
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
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
      "name": "writeReceipt",
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
          "name": "protocolAccount",
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
              "name": "anchorCompressedProof"
            }
          }
        },
        {
          "name": "outputTreeIndex",
          "type": "u8"
        },
        {
          "name": "recipientHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "notificationId",
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
      "name": "identityAccount",
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
      "name": "protocolRegistryAccount",
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
      "name": "subscriptionVaultAccount",
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
      "name": "identityDeleted",
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
      "name": "identityRegistered",
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
      "name": "identityUpdated",
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
      "name": "notificationDelivered",
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
      "name": "paymentReceived",
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
      "name": "periodReset",
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
      "name": "preferencesUpdated",
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
      "name": "protocolDeactivated",
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
      "name": "protocolReactivated",
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
      "name": "protocolRegistered",
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
      "name": "protocolSendRecorded",
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
      "name": "protocolSuspended",
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
      "name": "protocolTierUpdated",
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
      "name": "subscriptionRenewed",
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
      "name": "emailTooLong",
      "msg": "Encrypted email exceeds maximum length of 200 bytes"
    },
    {
      "code": 6001,
      "name": "emailEmpty",
      "msg": "Encrypted email must not be empty"
    },
    {
      "code": 6002,
      "name": "invalidEmailHash",
      "msg": "Email hash must be exactly 32 bytes (SHA-256)"
    },
    {
      "code": 6003,
      "name": "invalidNonce",
      "msg": "Nonce must be exactly 24 bytes"
    },
    {
      "code": 6004,
      "name": "emptyUpdate",
      "msg": "Update must modify at least one field"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized: signer does not match required authority"
    },
    {
      "code": 6006,
      "name": "ownerMismatch",
      "msg": "Unauthorized: signer does not own this identity account"
    },
    {
      "code": 6007,
      "name": "invalidTier",
      "msg": "Invalid tier: must be 0 (dev), 1 (growth), 2 (scale), or 3 (enterprise)"
    },
    {
      "code": 6008,
      "name": "protocolInactive",
      "msg": "Protocol is not active"
    },
    {
      "code": 6009,
      "name": "protocolAlreadyDeactivated",
      "msg": "Protocol is already deactivated"
    },
    {
      "code": 6010,
      "name": "protocolSuspended",
      "msg": "Protocol has been suspended by Herald and cannot send notifications"
    },
    {
      "code": 6011,
      "name": "protocolAlreadyActive",
      "msg": "Protocol is already active; no need to reactivate"
    },
    {
      "code": 6012,
      "name": "subscriptionExpired",
      "msg": "Protocol subscription has expired; renew to continue sending"
    },
    {
      "code": 6013,
      "name": "subscriptionNotActive",
      "msg": "Protocol has not yet subscribed; subscription_expires_at is zero"
    },
    {
      "code": 6014,
      "name": "sendsLimitExceeded",
      "msg": "Protocol has reached the maximum sends for this billing period"
    },
    {
      "code": 6015,
      "name": "sendsOverflow",
      "msg": "Protocol sends counter would overflow"
    },
    {
      "code": 6016,
      "name": "invalidSubscriptionExpiry",
      "msg": "New subscription expiry must be in the future"
    },
    {
      "code": 6017,
      "name": "devTierNoPayment",
      "msg": "Developer tier is free; payment not required"
    },
    {
      "code": 6018,
      "name": "unsupportedPaymentToken",
      "msg": "Unsupported payment token; must be USDC or USDT"
    },
    {
      "code": 6019,
      "name": "invalidCategory",
      "msg": "Invalid category: must be 0 (DeFi), 1 (Governance), 2 (Marketing), or 3 (Other)"
    },
    {
      "code": 6020,
      "name": "invalidRecipientHash",
      "msg": "Recipient hash must be exactly 32 bytes (SHA-256)"
    },
    {
      "code": 6021,
      "name": "invalidNotificationId",
      "msg": "Notification ID must be exactly 16 bytes (UUID v4)"
    },
    {
      "code": 6022,
      "name": "lightCpiAccountsError",
      "msg": "Failed to initialise Light Protocol CPI accounts"
    },
    {
      "code": 6023,
      "name": "lightAccountError",
      "msg": "Failed to attach compressed account to Light CPI"
    },
    {
      "code": 6024,
      "name": "lightCpiInvocationError",
      "msg": "Light Protocol CPI invocation failed"
    },
    {
      "code": 6025,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6026,
      "name": "clockUnavailable",
      "msg": "Clock sysvar unavailable"
    }
  ],
  "types": [
    {
      "name": "anchorCompressedProof",
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
      "name": "identityAccount",
      "docs": [
        "User identity account storing encrypted email and notification preferences.",
        "",
        "PDA Seeds: `[\"identity\", owner.key().as_ref()]`",
        "Space: 8 (discriminator) + fields ≈ 342 bytes; allocated via InitSpace."
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
            "name": "encryptedEmail",
            "docs": [
              "NaCl-encrypted email address (max 200 bytes)."
            ],
            "type": "bytes"
          },
          {
            "name": "emailHash",
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
            "name": "registeredAt",
            "docs": [
              "Unix timestamp of initial registration."
            ],
            "type": "i64"
          },
          {
            "name": "optInAll",
            "docs": [
              "Global opt-in for all notification categories."
            ],
            "type": "bool"
          },
          {
            "name": "optInDefi",
            "docs": [
              "Opt-in for DeFi notifications."
            ],
            "type": "bool"
          },
          {
            "name": "optInGovernance",
            "docs": [
              "Opt-in for governance notifications."
            ],
            "type": "bool"
          },
          {
            "name": "optInMarketing",
            "docs": [
              "Opt-in for marketing notifications."
            ],
            "type": "bool"
          },
          {
            "name": "digestMode",
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
      "name": "identityDeleted",
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
      "name": "identityRegistered",
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
            "name": "emailHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "optInAll",
            "type": "bool"
          },
          {
            "name": "optInDefi",
            "type": "bool"
          },
          {
            "name": "optInGovernance",
            "type": "bool"
          },
          {
            "name": "optInMarketing",
            "type": "bool"
          },
          {
            "name": "digestMode",
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
      "name": "identityUpdated",
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
            "name": "emailChanged",
            "type": "bool"
          },
          {
            "name": "preferencesChanged",
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
      "name": "notificationDelivered",
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
            "name": "recipientHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "notificationId",
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
            "name": "sendsThisPeriod",
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
      "name": "paymentReceived",
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
            "name": "amountUsdc",
            "type": "u64"
          },
          {
            "name": "tokenMint",
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
            "name": "newExpiry",
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
      "name": "periodReset",
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
            "name": "sendsLastPeriod",
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
      "name": "preferencesUpdated",
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
            "name": "optInAll",
            "type": "bool"
          },
          {
            "name": "optInDefi",
            "type": "bool"
          },
          {
            "name": "optInGovernance",
            "type": "bool"
          },
          {
            "name": "optInMarketing",
            "type": "bool"
          },
          {
            "name": "digestMode",
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
      "name": "protocolDeactivated",
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
      "name": "protocolReactivated",
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
      "name": "protocolRegistered",
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
            "name": "nameHash",
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
      "name": "protocolRegistryAccount",
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
            "name": "nameHash",
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
            "name": "subscriptionExpiresAt",
            "docs": [
              "Unix timestamp when the current subscription period expires.",
              "0 means not yet active (registered but not yet subscribed)."
            ],
            "type": "i64"
          },
          {
            "name": "lastRenewedAt",
            "docs": [
              "Unix timestamp of the last subscription renewal."
            ],
            "type": "i64"
          },
          {
            "name": "periodsPaid",
            "docs": [
              "Total number of complete billing periods successfully paid."
            ],
            "type": "u32"
          },
          {
            "name": "sendsThisPeriod",
            "docs": [
              "Number of sends consumed in the current billing period."
            ],
            "type": "u64"
          },
          {
            "name": "isActive",
            "docs": [
              "Whether this protocol is allowed to send notifications.",
              "Set to false on deactivation or subscription lapse."
            ],
            "type": "bool"
          },
          {
            "name": "isSuspended",
            "docs": [
              "Whether the protocol has been explicitly suspended by Herald (not just lapsed)."
            ],
            "type": "bool"
          },
          {
            "name": "lifetimeUsdcPaid",
            "docs": [
              "Accumulated USDC paid lifetime (6-decimal base units, for analytics)."
            ],
            "type": "u64"
          },
          {
            "name": "lastPaymentMint",
            "docs": [
              "Last payment token mint (USDC or USDT pubkey). Default if never paid."
            ],
            "type": "pubkey"
          },
          {
            "name": "registeredAt",
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
      "name": "protocolSendRecorded",
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
            "name": "sendsThisPeriod",
            "type": "u64"
          },
          {
            "name": "sendsLimit",
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
      "name": "protocolSuspended",
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
      "name": "protocolTierUpdated",
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
            "name": "oldTier",
            "type": "u8"
          },
          {
            "name": "newTier",
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
      "name": "subscriptionRenewed",
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
            "name": "newExpiry",
            "type": "i64"
          },
          {
            "name": "periodsPaid",
            "type": "u32"
          },
          {
            "name": "usdcPaid",
            "docs": [
              "Zero when called via authority (Helio); actual USDC amount for on-chain payments."
            ],
            "type": "u64"
          },
          {
            "name": "paymentSource",
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
      "name": "subscriptionVaultAccount",
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
            "name": "totalUsdcCollected",
            "docs": [
              "Total USDC accumulated (6-decimal base units)."
            ],
            "type": "u64"
          },
          {
            "name": "totalUsdtCollected",
            "docs": [
              "Total USDT accumulated (6-decimal base units)."
            ],
            "type": "u64"
          },
          {
            "name": "lastWithdrawalAt",
            "docs": [
              "Last withdrawal timestamp."
            ],
            "type": "i64"
          },
          {
            "name": "withdrawalCount",
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
    }
  ]
} as const;
