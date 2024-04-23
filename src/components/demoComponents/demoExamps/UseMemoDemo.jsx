import MemoComponent from "./MemoComponent";
export const UseMemoDemo = () => {
  const largeArr = new Array(30_000_000).fill(0).map((_, i) => {
    return { index: i, isMine: i === 27_000_000 };
  });
  return (
    <div>
      <h3>UseMemoDemo</h3>
      <h4>Using Memo</h4>
      <div>
        <MemoComponent largeArr={largeArr} useMem={true} />
      </div>
      <h4>NotUsing Memo</h4>
      <div>
        <MemoComponent largeArr={largeArr} />
      </div>
    </div>
  );
};
