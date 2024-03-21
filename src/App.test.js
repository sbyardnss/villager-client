import { render, screen } from '@testing-library/react';
// import App from './modules/App';
import VillagerChess from './VillagerChess';
test('renders learn react link', () => {
  render(<VillagerChess />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
