import Grid from '@core/grid/Grid';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import Simulation from '@core/Simulation';

describe('MinimalRenderer', () => {
  it('attaches and removes itself from the DOM', async () => {
    document.body.innerHTML = '';
    expect(document.body.querySelector('canvas')).not.toBeTruthy();
    const minimalRenderer = new MinimalRenderer();
    await minimalRenderer.create();
    expect(document.body.querySelector('canvas')).toBeTruthy();
    minimalRenderer.destroy();
    expect(document.body.querySelector('canvas')).not.toBeTruthy();
  });
  it('receives simulation start event', async () => {
    const minimalRenderer = new MinimalRenderer();
    await minimalRenderer.create();
    const onSimulationStartedSpy = spyOn(
      minimalRenderer,
      'onSimulationStarted'
    );
    const simulation = new Simulation(minimalRenderer);
    simulation.start(new Grid(undefined, undefined, undefined));
    expect(onSimulationStartedSpy).toHaveBeenCalled();
  });
});
