/**
 * Split an ordered token list into runs of consecutive tokens with the same speaker.
 *
 * 把有序 token 列表按说话人切分成连续轮次：同一说话人的相邻 token 归为一段，
 * 说话人变化即开启新的一段。
 */
export const group = <Item>(items: ReadonlyArray<Item>, speaker: (item: Item) => unknown) =>
  items.reduce<Array<Array<Item>>>((turns, item) => {
    const last = turns.at(-1)
    if (last === undefined || speaker(last[0]) !== speaker(item)) return [...turns, [item]]
    last.push(item)
    return turns
  }, [])

export * as SpeakerTurns from "./speaker-turns.js"
