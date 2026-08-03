import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import FileUploader from './FileUploader'

function createFile(name: string, size: number, type: string) {
  const file = new File([], name, { type })
  Object.defineProperty(file, 'size', {
    get() {
      return size
    },
  })
  return file
}
describe('FileUploader', () => {
  it('should match snapshots for each variant', () => {
    const onDrop = jest.fn()
    expect(render(<FileUploader onDrop={onDrop} />).container).toMatchSnapshot()

    expect(render(<FileUploader onDrop={onDrop} />).container).toMatchSnapshot()
  })

  it('should properly handle custom prompts and subprompts', () => {
    const onDrop = jest.fn()
    expect(
      render(
        <FileUploader onDrop={onDrop} prompt="I am a simple string prompt" />,
      ).container,
    ).toMatchSnapshot()

    expect(
      render(
        <FileUploader
          onDrop={onDrop}
          prompt="I am a simple string prompt"
          subPrompt="I am a simple string subprompt"
        />,
      ).container,
    ).toMatchSnapshot()

    expect(
      render(
        <FileUploader
          onDrop={onDrop}
          prompt={
            <p>
              I am a <span className="font-medium">React Element</span> prompt!
            </p>
          }
          subPrompt={
            <p>
              I am a <span className="font-medium">React Element</span>{' '}
              subprompt!
            </p>
          }
        />,
      ).container,
    ).toMatchSnapshot()
  })

  it('should show an overlay with a drop message when content is dragged over the drop zone', async () => {
    const onDrop = jest.fn()

    render(<FileUploader onDrop={onDrop} />)

    const files = [createFile('file1.pdf', 1111, 'application/pdf')]

    const dropZone = screen.getByTestId('dragZone')
    fireEvent.dragEnter(dropZone, {
      dataTransfer: {
        files,
        items: files.map((file) => ({
          kind: 'file',
          size: file.size,
          type: file.type,
          getAsFile: () => file,
        })),
        types: ['Files'],
      },
    })

    await waitFor(() =>
      expect(screen.getByText('Drop your file here')).toBeInTheDocument(),
    )
  })

  it('should invoke the onDrop callback when a file is dropped in the drop zone', async () => {
    const onDrop = jest.fn()

    render(<FileUploader onDrop={onDrop} />)

    const files = [createFile('file1.pdf', 1111, 'application/pdf')]

    const dropZone = screen.getByTestId('dragZone')
    const event = {
      dataTransfer: {
        files,
        items: files.map((file) => ({
          kind: 'file',
          size: file.size,
          type: file.type,
          getAsFile: () => file,
        })),
        types: ['Files'],
      },
    }
    fireEvent.dragEnter(dropZone, event)
    fireEvent.dragOver(dropZone, event)
    fireEvent.drop(dropZone, event)

    await waitFor(() =>
      expect(onDrop).toHaveBeenCalledWith(
        [files[0]],
        expect.anything(),
        expect.anything(),
      ),
    )
  })

  it('should properly handle file acceptance constraints', async () => {
    const onDrop = jest.fn()

    render(<FileUploader onDrop={onDrop} accept={{ 'application/pdf': [] }} />)

    const files = [
      createFile('file1.pdf', 1111, 'application/pdf'),
      createFile('image1.jpeg', 1111, 'image/jpeg'),
      createFile('file2.pdf', 1111, 'application/pdf'),
    ]

    const dropZone = screen.getByTestId('dragZone')
    const event = {
      dataTransfer: {
        files,
        items: files.map((file) => ({
          kind: 'file',
          size: file.size,
          type: file.type,
          getAsFile: () => file,
        })),
        types: ['Files'],
      },
    }
    fireEvent.dragEnter(dropZone, event)
    fireEvent.dragOver(dropZone, event)
    fireEvent.drop(dropZone, event)

    await waitFor(() =>
      expect(onDrop).toHaveBeenCalledWith(
        [files[0], files[2]],
        expect.anything(),
        expect.anything(),
      ),
    )
  })
})
