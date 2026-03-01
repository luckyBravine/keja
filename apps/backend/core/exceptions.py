"""
Custom exception handler for consistent error responses across the API.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Return a consistent error format: { error: { code, message, details } }.
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_code = exc.__class__.__name__
        error_message = str(exc)

        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                details = exc.detail
            elif isinstance(exc.detail, list):
                details = {'errors': exc.detail}
            else:
                details = {'message': str(exc.detail)}
        else:
            details = response.data if isinstance(response.data, dict) else {'errors': response.data}

        response.data = {
            'error': {
                'code': error_code,
                'message': error_message,
                'details': details,
            }
        }

    return response
