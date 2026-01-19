import { SetMetadata, UseGuards, applyDecorators, Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw error if auth fails, just return null user
    return user || null;
  }
}

/**
 * Decorator that allows both authenticated and unauthenticated access.
 * If a valid token is provided, the user will be populated.
 * If no token or invalid token, the request continues without user.
 */
export const OptionalAuth = () =>
  applyDecorators(
    SetMetadata(IS_OPTIONAL_AUTH_KEY, true),
    UseGuards(OptionalJwtAuthGuard),
  );
