import "./TetrominoLoader.css";

// Tetromino "Compose" loader (dev.to #15) — Maalik's pick, in
// place of the old spinner ring. Four 3D blocks slide into the
// composed logo while a repo file loads. Scaled ~50% and inverted
// (light sides, dark top) so it reads on the black editor
// background; the keyframes live in TetrominoLoader.css.
export function TetrominoLoader() {
  return (
    <div className="tetrominos" role="status" aria-label="Loading file">
      <div className="tetromino box1" />
      <div className="tetromino box2" />
      <div className="tetromino box3" />
      <div className="tetromino box4" />
    </div>
  );
}
