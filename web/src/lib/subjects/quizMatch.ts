/* 퀴즈 입력 채점 — 띄어쓰기·문장부호·괄호 속 말은 보지 않는다 */
const norm = (s: string) => s.replace(/\([^)]*\)|\[[^\]]*\]|（[^）]*）/g, '').replace(/[\s~.,·…!?'"“”‘’-]/g, '').toLowerCase();

/** 한글 뜻: '사람, 남자'처럼 여러 뜻이면 하나만 맞아도 정답 */
export function koMatch(you: string, answer: string) {
  const y = norm(you);
  if (!y) return false;
  if (y === norm(answer)) return true;
  return answer.split(/[,;/·]|\s{2,}/).some((t) => norm(t) && norm(t) === y);
}

/** 용어·철자: 대소문자·띄어쓰기만 가리지 않음 */
export const exactMatch = (you: string, answer: string) => !!norm(you) && norm(you) === norm(answer);
