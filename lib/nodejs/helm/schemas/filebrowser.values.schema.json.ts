export const filebrowser = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "required": [
    "address",
    "auth",
    "baseUrl",
    "global",
    "image",
    "ingress",
    "init",
    "oauth2-proxy",
    "persistence",
    "port",
    "service"
  ],
  "properties": {
    "address": {
      "type": "string"
    },
    "auth": {
      "type": "object",
      "properties": {
        "method": {
          "type": "string",
          "enum": [
            "json",
            "proxy",
            "noauth"
          ]
        },
        "header": {
          "type": "string"
        }
      }
    },
    "baseUrl": {
      "type": "string"
    },
    "branding": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "theme": {
          "type": "string"
        },
        "disableUsedPercentage": {
          "type": [
            "string",
            "null"
          ]
        },
        "disableExternal": {
          "type": [
            "string",
            "null"
          ]
        },
        "files": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "existingConfigMap": {
      "type": "string"
    },
    "extraVolumeMounts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "name",
          "mountPath"
        ],
        "properties": {
          "mountPath": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "subPath": {
            "type": "string"
          }
        }
      }
    },
    "extraVolumes": {
      "type": "array"
    },
    "global": {
      "type": "object",
      "properties": {
        "gid": {
          "type": "number"
        },
        "registry": {
          "type": "string"
        },
        "uid": {
          "type": "number"
        }
      }
    },
    "image": {
      "type": "object",
      "properties": {
        "registry": {
          "type": "string"
        },
        "repository": {
          "type": "string"
        },
        "tag": {
          "type": "string"
        },
        "digest": {
          "type": "string"
        }
      }
    },
    "ingress": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "annotations": {
          "type": "object"
        },
        "ingressClassName": {
          "type": "string"
        },
        "host": {
          "type": "string"
        },
        "path": {
          "type": "string"
        },
        "pathType": {
          "type": "string"
        },
        "tls": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean"
            }
          }
        }
      }
    },
    "init": {
      "type": "object",
      "properties": {
        "image": {
          "type": "object",
          "properties": {
            "registry": {
              "type": "string"
            },
            "repository": {
              "type": "string"
            },
            "tag": {
              "type": "string"
            },
            "digest": {
              "type": "string"
            }
          }
        },
        "securityContext": {
          "type": "object"
        },
        "resources": {
          "type": "object",
          "properties": {
            "limits": {
              "type": "object",
              "properties": {
                "cpu": {
                  "type": "string"
                },
                "memory": {
                  "type": "string"
                }
              }
            },
            "requests": {
              "type": "object",
              "properties": {
                "cpu": {
                  "type": "string"
                },
                "memory": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "oauth2-proxy": {
      "type": "object",
      "required": [
        "enabled"
      ],
      "properties": {
        "enabled": {
          "type": "boolean"
        }
      }
    },
    "persistence": {
      "type": "object",
      "required": [
        "enabled"
      ],
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "size": {
          "type": "string"
        },
        "storageClassName": {
          "type": "string"
        }
      }
    },
    "port": {
      "type": "number"
    },
    "resources": {
      "type": "object",
      "properties": {
        "limits": {
          "type": "object",
          "properties": {
            "cpu": {
              "type": "string"
            },
            "memory": {
              "type": "string"
            }
          }
        },
        "requests": {
          "type": "object",
          "properties": {
            "cpu": {
              "type": "string"
            },
            "memory": {
              "type": "string"
            }
          }
        }
      }
    },
    "securityContext": {
      "type": "object"
    },
    "service": {
      "type": "object",
      "required": [
        "port",
        "type"
      ],
      "properties": {
        "port": {
          "type": "integer"
        },
        "type": {
          "type": "string"
        },
        "clusterIP": {
          "type": "string"
        },
        "loadBalancerIP": {
          "type": "string"
        }
      }
    },
    "viewMode": {
      "type": "string",
      "enum": [
        "list",
        "mosaic"
      ]
    }
  },
  "type": "object"
} as const;
