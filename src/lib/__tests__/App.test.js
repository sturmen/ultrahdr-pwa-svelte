/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
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

  it('renders a minimal header and keeps trust messaging on the About page', async () => {
    render(App);

    await screen.findByRole('heading', { name: /UltraHDR Converter/i });

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.queryByText(/private processing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/works offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no cloud upload/i)).not.toBeInTheDocument();
  });

  it('opens About page from footer and shows technical explanation with feature taglines', async () => {
    render(App);

    await screen.findByTestId('upload-drop-zone');
    await fireEvent.click(screen.getByRole('button', { name: /about/i }));

    expect(screen.getByRole('heading', { name: /About UltraHDR Converter/i })).toBeInTheDocument();
    expect(screen.getByText(/no cloud upload/i)).toBeInTheDocument();
    expect(screen.getByText(/works offline/i)).toBeInTheDocument();
    expect(screen.getByText(/private processing/i)).toBeInTheDocument();
    expect(screen.getByText(/the app is a progressive web app/i)).toBeInTheDocument();
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
