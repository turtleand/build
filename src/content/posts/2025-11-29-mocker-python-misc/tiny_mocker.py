import importlib
from unittest.mock import MagicMock


class TinyMocker:
    def __init__(self):
        # Each entry: (module_object, attr_name, original_value)
        self._undo_stack = []

    def patch(self, target: str, replacement=None, **kwargs):
        """
        target: string like 'package.module.attr'
        replacement: optional object to install instead.
                     If None, we'll create a MagicMock for you.
        kwargs: extra keyword args passed to MagicMock
                (e.g. return_value=..., side_effect=...)
        """
        # 1. Split "notifications.mailer.send_mail"
        module_path, attr_name = target.rsplit(".", 1)

        # 2. Import the module object
        module = importlib.import_module(module_path)

        # 3. Fetch the original attribute
        original = getattr(module, attr_name)

        # 4. If no replacement given, build a MagicMock
        if replacement is None:
            replacement = MagicMock(**kwargs)
        else:
            # If you pass a replacement AND kwargs, kwargs are ignored here.
            # (Real pytest-mock is more flexible; this is minimal.)
            pass

        # 5. Set the module attribute to the new replacement
        setattr(module, attr_name, replacement)

        # 6. Remember how to undo this
        self._undo_stack.append((module, attr_name, original))

        # 7. Return the fake object so the test can assert on it
        return replacement

    def stopall(self):
        """Undo every patch (LIFO order)."""
        while self._undo_stack:
            module, attr_name, original = self._undo_stack.pop()
            setattr(module, attr_name, original)
