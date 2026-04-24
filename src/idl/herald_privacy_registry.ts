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
      "name": "migrateIdentityChannels",
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
          "name": "identityAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "migrateNotificationKeySpace",
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
          "name": "identityAccount",
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
      "name": "registerNotificationKey",
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
          "name": "identityAccount",
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
          "name": "sealedX25519Pubkey",
          "type": {
            "array": [
              "u8",
              48
            ]
          }
        },
        {
          "name": "senderX25519Pubkey",
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
      "name": "registerSms",
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
          "name": "identityAccount",
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
          "name": "encryptedPhone",
          "type": "bytes"
        },
        {
          "name": "phoneHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonceSms",
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
      "name": "registerTelegram",
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
          "name": "identityAccount",
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
          "name": "encryptedTelegramId",
          "type": "bytes"
        },
        {
          "name": "telegramIdHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonceTelegram",
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
      "name": "removeChannel",
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
          "name": "identityAccount",
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
              "name": "channelType"
            }
          }
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
      "name": "revokeNotificationKey",
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
          "name": "identityAccount",
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
      "name": "rotateNotificationKey",
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
          "name": "identityAccount",
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
          "name": "newSealedX25519Pubkey",
          "type": {
            "array": [
              "u8",
              48
            ]
          }
        },
        {
          "name": "newSenderX25519Pubkey",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "newNonce",
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
      "name": "updateChannelSettings",
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
          "name": "identityAccount",
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
          "name": "channelEmail",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "channelTelegram",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "channelSms",
          "type": {
            "option": "bool"
          }
        }
      ]
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
      "name": "channelRemoved",
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
      "name": "channelSettingsUpdated",
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
      "name": "notificationKeyRegistered",
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
      "name": "notificationKeyRevoked",
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
      "name": "notificationKeyRotated",
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
      "name": "smsRegistered",
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
    },
    {
      "name": "telegramRegistered",
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
    },
    {
      "code": 6027,
      "name": "telegramIdEmpty",
      "msg": "Encrypted Telegram ID must not be empty"
    },
    {
      "code": 6028,
      "name": "telegramIdTooLong",
      "msg": "Encrypted Telegram ID exceeds maximum length of 80 bytes"
    },
    {
      "code": 6029,
      "name": "telegramNotRegistered",
      "msg": "Telegram channel not registered; add Telegram before enabling it"
    },
    {
      "code": 6030,
      "name": "phoneEmpty",
      "msg": "Encrypted phone number must not be empty"
    },
    {
      "code": 6031,
      "name": "phoneTooLong",
      "msg": "Encrypted phone number exceeds maximum length of 65 bytes"
    },
    {
      "code": 6032,
      "name": "smsNotRegistered",
      "msg": "SMS channel not registered; add phone before enabling it"
    },
    {
      "code": 6033,
      "name": "noActiveChannels",
      "msg": "At least one delivery channel must remain active"
    },
    {
      "code": 6034,
      "name": "invalidChannelType",
      "msg": "Invalid channel type: must be 0 (Telegram) or 1 (SMS)"
    },
    {
      "code": 6035,
      "name": "zeroSealedPubkey",
      "msg": "Sealed pubkey cannot be all zeros — invalid key material"
    },
    {
      "code": 6036,
      "name": "zeroNotificationNonce",
      "msg": "Notification nonce cannot be all zeros — replay attack risk"
    },
    {
      "code": 6037,
      "name": "unsupportedNotificationKeyVersion",
      "msg": "Unsupported notification key version"
    },
    {
      "code": 6038,
      "name": "maxNotificationKeyRotationsExceeded",
      "msg": "Max notification key rotations reached — revoke and re-register"
    },
    {
      "code": 6039,
      "name": "notificationNonceReuse",
      "msg": "Notification nonce must differ from current nonce on rotation"
    },
    {
      "code": 6040,
      "name": "notificationKeyNotRegistered",
      "msg": "No notification key registered — cannot rotate or revoke"
    },
    {
      "code": 6041,
      "name": "identityNotRegistered",
      "msg": "Identity account must be registered before adding a notification key"
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
      "name": "channelRemoved",
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
      "name": "channelSettingsUpdated",
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
            "name": "channelEmail",
            "type": "bool"
          },
          {
            "name": "channelTelegram",
            "type": "bool"
          },
          {
            "name": "channelSms",
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
      "name": "channelType",
      "docs": [
        "Channel type enum for per-channel removal (GDPR erasure)."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "telegram"
          },
          {
            "name": "sms"
          }
        ]
      }
    },
    {
      "name": "identityAccount",
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
          },
          {
            "name": "channelEmail",
            "docs": [
              "Email channel enabled (default true — all existing accounts)."
            ],
            "type": "bool"
          },
          {
            "name": "channelTelegram",
            "docs": [
              "Telegram channel enabled."
            ],
            "type": "bool"
          },
          {
            "name": "channelSms",
            "docs": [
              "SMS channel enabled."
            ],
            "type": "bool"
          },
          {
            "name": "encryptedTelegramId",
            "docs": [
              "NaCl box encrypted Telegram chat_id (int64 as string).",
              "Format: [ephemeral_pubkey(32) || box(chat_id_str, nonce_tg)].",
              "Empty Vec = not registered.",
              "Max 80 bytes: 32 ephemeral + ~16 overhead + max 10 char chat_id."
            ],
            "type": "bytes"
          },
          {
            "name": "telegramIdHash",
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
            "name": "nonceTelegram",
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
            "name": "encryptedPhone",
            "docs": [
              "NaCl box encrypted E.164 phone number (e.g. \"+14155552671\").",
              "Format: [ephemeral_pubkey(32) || box(phone_e164, nonce_sms)].",
              "Empty Vec = not registered.",
              "Max 65 bytes: 32 ephemeral + ~16 overhead + max 15 char E.164."
            ],
            "type": "bytes"
          },
          {
            "name": "phoneHash",
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
            "name": "nonceSms",
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
            "name": "sealedX25519Pubkey",
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
            "name": "senderX25519Pubkey",
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
            "name": "notificationNonce",
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
            "name": "notificationKeyVersion",
            "docs": [
              "Schema version for the notification key format.",
              "Allows the enclave to handle format migrations gracefully."
            ],
            "type": "u8"
          },
          {
            "name": "notificationKeyUpdatedAt",
            "docs": [
              "Unix timestamp of last notification key registration or rotation."
            ],
            "type": "i64"
          },
          {
            "name": "notificationKeyRotationCount",
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
      "name": "notificationKeyRegistered",
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
            "name": "registeredAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "notificationKeyRevoked",
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
            "name": "revokedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "notificationKeyRotated",
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
            "name": "rotationCount",
            "type": "u32"
          },
          {
            "name": "rotatedAt",
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
      "name": "smsRegistered",
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
            "name": "phoneHash",
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
    },
    {
      "name": "telegramRegistered",
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
            "name": "telegramIdHash",
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
} as const;
