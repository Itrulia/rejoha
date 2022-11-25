import { Injectable } from '@nestjs/common';
import { select } from 'd3';
import { JSDOM } from 'jsdom';
import { BehaviorSubject } from 'rxjs';
import { optimize } from 'svgo';

@Injectable()
export class AppService {
  private size = 1024;
  private lineHeight = 50;
  private linePadding = 10;
  private lineGroupMargin = 10;

  private previousImage = new BehaviorSubject<{
    id: string;
    svg: string;
  } | null>(null);

  private async getPollData(id: string) {
    const query = `
      fragment NeededBlocks on Block {
        __typename
        ... on PollBlock {
          poll {
            id
            answers {
              votes
            }
          }
        }
      }

      query Article($id: ID!) {
        article(id: $id) {
          id
          blocks {
            ...NeededBlocks
          }
        }
      }
    `;

    const result = await (
      await fetch(process.env['WE_PUBLISH_API_URL'], {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operationName: 'Article',
          query,
          variables: {
            id,
          },
        }),
        method: 'POST',
      })
    ).json();

    const pollBlock = result?.data.article.blocks.find(
      ({ __typename }) => __typename === 'PollBlock'
    );

    if (!pollBlock) {
      return {
        id: '',
        answers: [],
      };
    }

    return {
      id: pollBlock.poll.id,
      answers: pollBlock.poll.answers,
    };
  }

  public async getData(id: string) {
    const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    const body = select(dom.window.document.querySelector('body'));
    const svg = body
      .append('svg')
      .attr('width', this.size)
      .attr('height', this.size)
      .attr('xmlns', 'http://www.w3.org/2000/svg');

    const data = await this.getPollData(id);
    const groupSize = 4 * 1 + 3 * this.linePadding + this.lineGroupMargin;

    data.answers.forEach((answer, index) => {
      const baseX = 2 + this.size - this.size / (index + 1);

      const linGroupLength = Math.ceil(answer.votes / 5);
      const lineGroups = Array.from({ length: linGroupLength }, (_, k) => {
        if ((k + 1) * 5 > answer.votes) {
          return Array.from({ length: answer.votes % 5 });
        }

        return Array.from({ length: 5 });
      });

      let row = 0;
      let previousRowGroupIndex = 0;

      lineGroups.forEach((group, groupIndex) => {
        group.forEach((_, i) => {
          const xOffset =
            groupIndex - previousRowGroupIndex
              ? groupSize * (groupIndex - previousRowGroupIndex)
              : 0;

          const x = baseX + i * this.linePadding + xOffset;
          const y =
            this.size -
            this.lineHeight -
            this.lineGroupMargin -
            row * (this.lineHeight + this.lineGroupMargin);

          const rect = svg
            .append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', y)
            .attr('y2', y + this.lineHeight)
            .style('stroke', index ? 'black' : 'red');

          if (i === 4) {
            const x1 = xOffset + baseX + 3 * this.linePadding;
            const x2 = xOffset + baseX + 0 * this.linePadding;

            rect
              .attr('x1', x1)
              .attr('x2', x2)
              .attr('y', 30 + 25);

            if (x1 / (index + 1) + groupSize > this.size / 2) {
              previousRowGroupIndex = groupIndex + 1;
              row++;
            }
          }
        });
      });
    });

    const newSvg = body.html();
    const previousSvg = this.previousImage.getValue();

    if (previousSvg?.id !== data.id) {
      this.previousImage.next({ id: data.id, svg: newSvg });
    } else {
      // @TODO: diff logic
    }

    const result = optimize(body.html(), {
      multipass: true,
    });

    return result.data;
  }
}
