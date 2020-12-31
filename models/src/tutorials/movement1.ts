import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const basicMovement: Tutorial = {
  id: 'movement-1',
  title: 'Basic Movement',
  description: '',
  locale: 'en',
  highlightScore: true,
  layout: tetrominoes.L,
  layoutRotation: 1,
  successLinesCleared: [2],
  mandatory: true,
  priority: 9000,
  //successActions: [] // TODO: hint when drop is not used
  grid: `
// first room - move right
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
// next room - move left
XXXXXXXXXXXXXXXXXXXXXX000XXXX
XXXXXXXXXXXXXXXXXXXXXX000XXXX
XXXXXXXXXXXXXXXXXXXXXX000XXXX
X00000000000000000000000000XX
X00000000000000000000000000XX
X00000000000000000000000000XX
X00000000000000000000000000XX
X00000000000000000000000000XX
X00000000000000000000000000XX
X00000000000000000000000000XX
// next room - move right
XX000XXXXXXXXXXXXXXXXXXXXXXXX
XX000XXXXXXXXXXXXXXXXXXXXXXXX
XX000XXXXXXXXXXXXXXXXXXXXXXXX
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X000000000000000000000000000X
// next room - lazers (move down)
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX000XXXXXXXXXXXXX
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
// next room - rotation 1
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
X000000000000000XXXXXXXXXXXXX
XXX00XXXXXXXXXXXXXXXXXXXXXXXX
XXX00XXXXXXXXXXXXXXXXXXXXXXXX
XXX00XXXXXXXXXXXXXXXXXXXXXXXX
// next room - rotation 2
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXXXXXXXXXXXXXX
X0000000000000XXX00000000000X
X0000000000000XXX00000000000X
X000000000000000000000000000X
X000000000000000000000000000X
X0000000000000XXX00000000000X
X0000000000000XXX00000000000X
X0000000000000XXX00000000000X
X0000000000000XXX00000000000X
X0000000000000XXX00000000000X
X0000000000000XXX00000000000X
XXXXXXXXXXXXXXXXX00000000000X
XXXXXXXXXXXXXXXXX00000000000X
XXXXXXXXXXXXXXXXX00000000000X
// next room - wrap
00000000000000XXX000000000000
00000000000000XXX000000000000
00000000000000XXX000000000000
00000000000000XXX000000000000
00000000000000XXX000000000000
00000000000000XXX000000000000
// next room - force wrap
XXX00000000000XXXXXXXXXXXXXXX
XXX00000000000XXXXXXXXXXXXXXX
XXX00000000000XXXXXXXXXXXXXXX
XXX00000000000XXXXXXXXXXXXXXX
XXX00000000000XXXXXXXXXXXXXXX
XXX00000000000XXXXXXXXXXXXXXX

// next room - drop prep
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX
XXX00000000000000000000000XXX

// next room - drop
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX000XXXXXXXXXXXXX
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLL
XXXXXXXXXXXXX000XXXXXXXXXXXXX
XXXXXXXXXXXXX0XXXXXXXXXXXXXXX
`,
  translations: {
    th: {
      title: 'การเคลื่อนไหวขั้นพื้นฐาน',
    },
  },
};

export default basicMovement;
