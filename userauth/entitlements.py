ENTITLEMENTS = {
    "free": {
        "maxLoops": 5,
        "speedOptions": [0.5, 0.75, 1.0],
    },
    "premium": {
        "maxLoops": None,
        "speedOptions": None,
    },
}


def get_entitlements(role):
    return ENTITLEMENTS.get(role, ENTITLEMENTS["free"])
