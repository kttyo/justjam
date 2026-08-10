ENTITLEMENTS = {
    "free": {
        "maxLoops": 5,
        "speedOptions": None,
    },
    "premium": {
        "maxLoops": None,
        "speedOptions": None,
    },
}


def get_entitlements(role):
    return ENTITLEMENTS.get(role, ENTITLEMENTS["free"])
