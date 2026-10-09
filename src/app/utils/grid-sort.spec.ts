import { ariaSort, loadSort, nextSort, saveSort, sortMark } from './grid-sort';

describe('grid sort', () => {
  const columns = ['employee', 'whenEntered', 'notes'];

  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('starts with the fallback when nothing was saved', () => {
    expect(loadSort('timesheet', columns, 'whenEntered:desc')).toBe('whenEntered:desc');
  });

  it('opens the way the person left the grid', () => {
    saveSort('timesheet', 'notes:asc');

    expect(loadSort('timesheet', columns, 'whenEntered:desc')).toBe('notes:asc');
  });

  it('keeps each grid\'s sort apart', () => {
    saveSort('timesheet', 'notes:asc');

    expect(loadSort('request', ['reason'], 'reason:desc')).toBe('reason:desc');
  });

  it('never sends a saved column the grid cannot sort by (the server would answer 400)', () => {
    saveSort('timesheet', 'password:asc');
    expect(loadSort('timesheet', columns, 'whenEntered:desc')).toBe('whenEntered:desc');

    saveSort('timesheet', 'notes:sideways');
    expect(loadSort('timesheet', columns, 'whenEntered:desc')).toBe('whenEntered:desc');
  });

  it('sorts a new column ascending and flips a column that is already sorted', () => {
    expect(nextSort('whenEntered:desc', 'notes')).toBe('notes:asc');
    expect(nextSort('notes:asc', 'notes')).toBe('notes:desc');
    expect(nextSort('notes:desc', 'notes')).toBe('notes:asc');
  });

  it('marks and announces only the sorted column', () => {
    expect(sortMark('notes:asc', 'notes')).toBe(' ▲');
    expect(sortMark('notes:desc', 'notes')).toBe(' ▼');
    expect(sortMark('notes:desc', 'employee')).toBe('');
    expect(ariaSort('notes:asc', 'notes')).toBe('ascending');
    expect(ariaSort('notes:desc', 'notes')).toBe('descending');
    expect(ariaSort('notes:desc', 'employee')).toBeNull();
  });
});
