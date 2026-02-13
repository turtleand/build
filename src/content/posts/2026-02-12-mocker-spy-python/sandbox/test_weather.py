from weather import format_forecast


def test_spy_where_used(mocker):
    """Spy on the name inside the module that calls it."""
    import weather

    spy = mocker.spy(weather, "celsius_to_fahrenheit")

    result = format_forecast("Buenos Aires", 25)

    assert result == "Buenos Aires: 25\u00b0C / 77.0\u00b0F"  # real function ran
    spy.assert_called_once_with(25)  # spy tracked the call
    assert spy.spy_return == 77.0  # spy recorded return value


def test_spy_wrong_target(mocker):
    """Spy on the definition site \u2014 misses calls through weather module."""
    import converter

    spy = mocker.spy(converter, "celsius_to_fahrenheit")

    result = format_forecast("Buenos Aires", 25)

    assert result == "Buenos Aires: 25\u00b0C / 77.0\u00b0F"  # function still works
    assert spy.call_count == 0  # spy saw nothing
