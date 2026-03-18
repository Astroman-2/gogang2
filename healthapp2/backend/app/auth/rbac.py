from typing import List
from fastapi import HTTPException, status
from app.models.user import User, UserRole


class RBACPermissions:
    """
    Role-Based Access Control Permission Matrix.
    
    Roles:
    - Admin: Full access to all resources
    - Physician: Clinical data, reports, billing
    - Clinician: Vitals, schedules, patient demographics
    """
    
    # Permission mappings
    ROLE_PERMISSIONS = {
        UserRole.ADMIN: {
            "patients": ["create", "read", "update", "delete"],
            "appointments": ["create", "read", "update", "delete", "authorize", "complete"],
            "billing": ["create", "read", "update", "delete"],
            "reports": ["read"],
            "users": ["create", "read", "update", "delete"],
        },
        UserRole.PHYSICIAN: {
            "patients": ["create", "read", "update"],
            "appointments": ["create", "read", "update", "authorize", "complete"],
            "billing": ["read"],
            "reports": ["read"],
            "users": ["read"],
        },
        UserRole.CLINICIAN: {
            "patients": ["read", "update"],  # Can update vitals
            "appointments": ["create", "read", "update"],  # Can schedule
            "billing": [],  # No billing access
            "reports": ["read"],
            "users": ["read"],
        },
    }
    
    @staticmethod
    def has_permission(user: User, resource: str, action: str) -> bool:
        """
        Check if a user has permission to perform an action on a resource.
        
        Args:
            user: User object
            resource: Resource name (e.g., 'patients', 'appointments')
            action: Action to perform (e.g., 'create', 'read', 'update', 'delete')
        
        Returns:
            True if user has permission, False otherwise
        """
        if not user or not user.is_active:
            return False
        
        permissions = RBACPermissions.ROLE_PERMISSIONS.get(user.role, {})
        resource_permissions = permissions.get(resource, [])
        
        return action in resource_permissions
    
    @staticmethod
    def require_permission(resource: str, action: str):
        """
        Decorator to require specific permission for an endpoint.
        
        Usage:
            @require_permission("patients", "create")
            async def create_patient(...):
                ...
        """
        def decorator(func):
            async def wrapper(*args, **kwargs):
                # Extract current_user from kwargs
                current_user = kwargs.get('current_user')
                
                if not current_user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Not authenticated"
                    )
                
                if not RBACPermissions.has_permission(current_user, resource, action):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Insufficient permissions. Required: {action} on {resource}"
                    )
                
                return await func(*args, **kwargs)
            
            return wrapper
        return decorator


def check_permission(user: User, resource: str, action: str) -> None:
    """
    Check permission and raise HTTPException if denied.
    
    Args:
        user: Current user
        resource: Resource name
        action: Action to perform
    
    Raises:
        HTTPException: If permission is denied
    """
    if not RBACPermissions.has_permission(user, resource, action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Your role ({user.role.value}) cannot {action} {resource}."
        )
