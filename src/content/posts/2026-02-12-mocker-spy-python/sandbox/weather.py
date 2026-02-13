from converter import celsius_to_fahrenheit


def format_forecast(city, temp_c):
    temp_f = celsius_to_fahrenheit(temp_c)
    return f"{city}: {temp_c}\u00b0C / {temp_f}\u00b0F"
