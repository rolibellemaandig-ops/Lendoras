/**
 * Application Configuration
 * Manages environment-specific settings and app configuration
 */

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

interface AppConfig {
  environment: Environment;
  apiUrl: string;
  apiTimeout: number;
  cacheTtl: number;
  maxRetries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  appVersion: string;
  buildNumber: string;
}

const environmentConfigs: Record<Environment, Partial<AppConfig>> = {
  [Environment.DEVELOPMENT]: {
    environment: Environment.DEVELOPMENT,
    apiUrl: 'http://localhost:3000',
    apiTimeout: 15000,
    cacheTtl: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    logLevel: 'debug',
    enableAnalytics: false,
    enableCrashReporting: false,
  },
  [Environment.STAGING]: {
    environment: Environment.STAGING,
    apiUrl: 'https://staging-api.lendora.app',
    apiTimeout: 10000,
    cacheTtl: 5 * 60 * 1000,
    maxRetries: 2,
    logLevel: 'info',
    enableAnalytics: true,
    enableCrashReporting: true,
  },
  [Environment.PRODUCTION]: {
    environment: Environment.PRODUCTION,
    apiUrl: 'https://api.lendora.app',
    apiTimeout: 10000,
    cacheTtl: 10 * 60 * 1000, // 10 minutes
    maxRetries: 2,
    logLevel: 'warn',
    enableAnalytics: true,
    enableCrashReporting: true,
  },
};

const defaultConfig: AppConfig = {
  environment: __DEV__ ? Environment.DEVELOPMENT : Environment.PRODUCTION,
  apiUrl: 'http://localhost:3000',
  apiTimeout: 10000,
  cacheTtl: 5 * 60 * 1000,
  maxRetries: 3,
  logLevel: 'info',
  enableAnalytics: !__DEV__,
  enableCrashReporting: !__DEV__,
  appVersion: '1.0.0',
  buildNumber: '1',
};

class Config {
  private config: AppConfig;

  constructor() {
    this.config = this.getConfig();
  }

  private getConfig(): AppConfig {
    const env = __DEV__ ? Environment.DEVELOPMENT : Environment.PRODUCTION;
    const envConfig = environmentConfigs[env];
    return {
      ...defaultConfig,
      ...envConfig,
    };
  }

  get appConfig(): AppConfig {
    return { ...this.config };
  }

  get environment(): Environment {
    return this.config.environment;
  }

  get apiUrl(): string {
    // Allow override via environment variable
    return process.env.REACT_APP_API_URL || this.config.apiUrl;
  }

  get apiTimeout(): number {
    return this.config.apiTimeout;
  }

  get cacheTtl(): number {
    return this.config.cacheTtl;
  }

  get maxRetries(): number {
    return this.config.maxRetries;
  }

  get logLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return this.config.logLevel;
  }

  get enableAnalytics(): boolean {
    return this.config.enableAnalytics;
  }

  get enableCrashReporting(): boolean {
    return this.config.enableCrashReporting;
  }

  get isDevelopment(): boolean {
    return this.config.environment === Environment.DEVELOPMENT;
  }

  get isProduction(): boolean {
    return this.config.environment === Environment.PRODUCTION;
  }

  get isStaging(): boolean {
    return this.config.environment === Environment.STAGING;
  }

  setEnvironment(env: Environment) {
    this.config.environment = env;
  }

  setApiUrl(url: string) {
    this.config.apiUrl = url;
  }

  updateConfig(updates: Partial<AppConfig>) {
    this.config = { ...this.config, ...updates };
  }

  getAppInfo() {
    return {
      version: this.config.appVersion,
      buildNumber: this.config.buildNumber,
      environment: this.config.environment,
    };
  }
}

export const config = new Config();
export default config;
