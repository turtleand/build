import importlib
from unittest.mock import MagicMock


class PocketMocker:
    """Tiny helper to mimic the patching API readers see from pytest-mock."""

    def __init__(self):
        self._stack = []

    def patch(self, target: str, replacement=None, **kwargs):
        module_path, attribute = target.rsplit(".", 1)
        module = importlib.import_module(module_path)
        original = getattr(module, attribute)
        if replacement is None:
            replacement = MagicMock(**kwargs)
        setattr(module, attribute, replacement)
        self._stack.append((module, attribute, original))
        return replacement

    def stopall(self):
        while self._stack:
            module, attribute, original = self._stack.pop()
            setattr(module, attribute, original)
