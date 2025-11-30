import high_level_module
from tiny_mocker import TinyMocker


def test_my_high_level_function(mocker):
    mocker.patch("high_level_module.my_special_function", return_value=30)
    assert high_level_module.my_high_level_function() == 30


def test_my_high_level_function_with_tiny_mocker():
    mocker = TinyMocker()
    mocker.patch("high_level_module.my_special_function", return_value=30)
    assert high_level_module.my_high_level_function() == 30
