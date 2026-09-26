import { describe, expect, it } from "vitest";
import { greetingCandidates, newCheckinTitles, pickGreeting } from "./greeting";

const GENERIC_COUNT = 5;

describe("greetingCandidates", () => {
  it("sem usuário: só genéricas", () => {
    const list = greetingCandidates(null);
    expect(list).toHaveLength(GENERIC_COUNT);
    expect(list).toContain("Vamo lá!!");
  });

  it("nada feito: genéricas + cardio, água e musculação", () => {
    const list = greetingCandidates([]);
    expect(list).toContain("Um cardiozin hoje?");
    expect(list).toContain("Bebe agua ai mo");
    expect(list).toContain("Dia de perna?");
    expect(list).not.toContain("Só mais um check in para super!!");
    expect(list).toContain("Vamo lá!!");
  });

  it("só omite a mensagem do tipo já feito", () => {
    const list = greetingCandidates(["water", "food"]);
    expect(list).not.toContain("Bebe agua ai mo");
    expect(list).toContain("Um cardiozin hoje?");
    expect(list).toContain("Dia de perna?");
  });

  it("falta um só: inclui a do super e a do tipo faltante", () => {
    const list = greetingCandidates(["water", "food", "gym"]);
    expect(list).toContain("Só mais um check in para super!!");
    expect(list).toContain("Um cardiozin hoje?");
    expect(list).not.toContain("Dia de perna?");
  });

  it("falta comida: só a do super (comida não tem mensagem própria)", () => {
    const list = greetingCandidates(["water", "gym", "cardio"]);
    expect(list).toHaveLength(GENERIC_COUNT + 1);
    expect(list).toContain("Só mais um check in para super!!");
  });

  it("tudo feito: só as de conclusão", () => {
    expect(greetingCandidates(["water", "food", "gym", "cardio"])).toEqual([
      "Agora só amanhã",
      "Trabalho concluido com sucesso",
    ]);
  });

  it("super não conta como tipo base", () => {
    expect(greetingCandidates(["super"])).toContain("Bebe agua ai mo");
  });
});

describe("pickGreeting", () => {
  const list = ["a", "b", "c"];

  it("escolhe pelo sorteio injetado", () => {
    expect(pickGreeting(list, () => 0)).toBe("a");
    expect(pickGreeting(list, () => 0.5)).toBe("b");
    expect(pickGreeting(list, () => 0.999)).toBe("c");
  });
});

describe("newCheckinTitles", () => {
  it("manhã e madrugada: só as neutras", () => {
    expect(newCheckinTitles(9)).toEqual(["Novo check in???", "Mais um???"]);
    expect(newCheckinTitles(0)).toHaveLength(2);
  });

  it("tarde: 12h até 17h59", () => {
    expect(newCheckinTitles(12)).toContain("Essa hora da tarde");
    expect(newCheckinTitles(17)).toContain("Essa hora da tarde");
    expect(newCheckinTitles(17)).not.toContain("Essa hora da noite?!");
  });

  it("noite: a partir das 18h", () => {
    expect(newCheckinTitles(18)).toContain("Essa hora da noite?!");
    expect(newCheckinTitles(23)).not.toContain("Essa hora da tarde");
  });
});
