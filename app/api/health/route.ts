/**
 * Health Check API Endpoint
 * 
 * Used by Google Cloud Run and monitoring systems to verify application health
 */

import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const dbHealthy = await testDatabaseConnection();
    
    // Basic application health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        provider: 'postgresql'
      },
      services: {
        nextjs: 'healthy',
        prisma: dbHealthy ? 'healthy' : 'unhealthy'
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };

    // Return 503 if database is unhealthy
    if (!dbHealthy) {
      return NextResponse.json(
        { ...health, status: 'unhealthy' },
        { status: 503 }
      );
    }

    return NextResponse.json(health, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 503 }
    );
  }
}

// Support HEAD requests for basic health checks
export async function HEAD(request: NextRequest) {
  try {
    const dbHealthy = await testDatabaseConnection();
    return new NextResponse(null, { 
      status: dbHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
} 