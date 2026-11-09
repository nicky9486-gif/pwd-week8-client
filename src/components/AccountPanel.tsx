import styled from '@emotion/styled';

const AccountPanel = styled.section`
  max-width: 650px; margin: 2rem auto; padding: 2rem;
  background: white; border-radius: 12px; box-shadow: 0 4px 20px #0001;
  h2, h3 { margin: 1rem 0; }
  p { margin: .75rem 0; }
  form { display: grid; gap: .75rem; margin: 1rem 0; }
  label { display: grid; gap: .3rem; font-weight: 600; }
  input, button { padding: .75rem; border: 1px solid #ddd; border-radius: 8px; }
  button { cursor: pointer; background: #667eea; color: white; }
  button:disabled { opacity: .55; cursor: not-allowed; }
  nav { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
  [role=alert] { color: #b22222; }
`;
export default AccountPanel;
