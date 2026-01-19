// CRITICAL: Do NOT import from @web3auth/base or @toruslabs/openlogin-jrpc at the top level!
// These packages access Buffer during module evaluation, causing "slice of undefined" errors.
// Instead, we lazy-load them and use any types for type safety.
// import { CustomChainConfig } from '@web3auth/base';
// import { SafeEventEmitter, JRPCRequest, JRPCResponse, SendCallBack } from '@toruslabs/openlogin-jrpc';

import { EventEmitter } from 'events';

/**
 * Minimal IBaseProvider implementation for Solana
 *
 * This provider satisfies the Web3Auth SDK's privateKeyProvider requirement
 * while providing access to the private key for Solana operations.
 */
export class SolanaPrivateKeyProvider extends (EventEmitter as any) {
  provider: any = null;
  currentChainConfig: any;
  private privKey: string | null = null;

  constructor(chainConfig: any) {
    super();
    this.currentChainConfig = chainConfig;

    // NOTE: No manual binding needed - EventEmitter handles this internally
    // Attempting to bind methods in constructor causes "Cannot read property 'bind' of undefined"
  }

  async setupProvider(privKey: string): Promise<void> {
    this.privKey = privKey;
    this.emit('init', { chainId: this.currentChainConfig.chainId });
  }

  get chainId(): string {
    return this.currentChainConfig.chainId as string;
  }

  async request<R>(_args: any): Promise<R | null> {
    // Handle common Solana RPC requests
    switch (_args.method) {
      case 'solanaPrivateKey':
      case 'private_key':
        return this.privKey as R;
      case 'solana_accounts':
        // Return accounts if we have a private key
        if (this.privKey) {
          // Import here to avoid circular dependencies
          const { deriveSolanaAddress } = require('../utils/solana');
          const address = await deriveSolanaAddress(this.privKey);
          return [address] as R;
        }
        return [] as R;
      default:
        return null as R;
    }
  }

  sendAsync<T, U>(req: any, callback?: any): any {
    // Implement sendAsync for compatibility
    if (callback) {
      // Callback style
      this.request<U>({ method: req.method, params: req.params as any[] })
        .then((result) => callback(null, { jsonrpc: '2.0', id: req.id, result }))
        .catch((error) => callback(error, { jsonrpc: '2.0', id: req.id, error }));
    } else {
      // Promise style
      return this.request<U>({ method: req.method, params: req.params as any[] })
        .then((result) => ({ jsonrpc: '2.0', id: req.id, result }))
        .catch((error) => ({ jsonrpc: '2.0', id: req.id, error }));
    }
  }

  send<T, U>(req: any, callback?: any): any {
    // send is an alias for sendAsync
    return this.sendAsync(req, callback);
  }

  addChain(chainConfig: any): void {
    this.currentChainConfig = chainConfig;
  }

  async switchChain(_params: { chainId: string }): Promise<void> {
    // For Solana, chain switching is not typically needed
    // This is a no-op for single-chain support
  }

  updateProviderEngineProxy(provider: any): void {
    this.provider = provider;
  }

  setKeyExportFlag(_enabled: boolean): void {
    // This is called by Web3Auth to set key export permissions
    // For this minimal implementation, we don't need to do anything
  }
}
