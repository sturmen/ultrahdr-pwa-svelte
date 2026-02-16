/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import App from '../../App.svelte';
import { consumeSharedFilesFromLaunch } from '../share-target-launch.js';

vi.mock('../share-target-launch.js', () => ({
  consumeSharedFilesFromLaunch: vi.fn(),
}));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('App shell and navigation frame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeSharedFilesFromLaunch.mockResolvedValue([]);
    window.history.replaceState({}, '', '/');
  });

  it('renders the mobile-native shell and trust indicators', async () => {
    render(App);

    await screen.findByRole('heading', { name: /UltraHDR Image Enhancer/i });

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByText(/private processing/i)).toBeInTheDocument();
    expect(screen.getByText(/works offline/i)).toBeInTheDocument();
    expect(screen.getByText(/no cloud upload/i)).toBeInTheDocument();
  });

  it('shows loading state while share-target launch files are being checked', async () => {
    const launchProbe = deferred();
    consumeSharedFilesFromLaunch.mockReturnValue(launchProbe.promise);

    render(App);

    expect(screen.getByText(/loading shared images/i)).toBeInTheDocument();

    launchProbe.resolve([]);
    await waitFor(() => {
      expect(screen.queryByText(/loading shared images/i)).not.toBeInTheDocument();
    });
  });

  it('shows drop zone when there are no files from share launch', async () => {
    consumeSharedFilesFromLaunch.mockResolvedValue([]);

    render(App);

    await screen.findByTestId('upload-drop-zone');
    expect(screen.getByTestId('upload-drop-zone')).toBeInTheDocument();
  });

  it('auto-triggers file picker for launch shortcut action=pick', async () => {
    window.history.replaceState({}, '', '/?action=pick');
    const inputClickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(App);

    await screen.findByTestId('upload-drop-zone');
    await waitFor(() => {
      expect(inputClickSpy).toHaveBeenCalled();
    });
  });
});
