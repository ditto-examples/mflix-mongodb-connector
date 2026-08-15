import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Tabs } from './Tabs'

export default {
  title: 'Components/Tabs',
  component: Tabs,
} as Meta

export const Default: StoryObj = {
  render: () => (
    <Tabs defaultValue="cars">
      <Tabs.List>
        <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        <Tabs.Trigger value="bicycles">Bicycles</Tabs.Trigger>
        <Tabs.Trigger value="skates">Skates</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="cars">
        <div className="pt-4">Cars contents</div>
      </Tabs.Content>
      <Tabs.Content value="bicycles">
        <div className="pt-4">Bicycles contents</div>
      </Tabs.Content>
      <Tabs.Content value="skates">
        <div className="pt-4">Skates contents</div>
      </Tabs.Content>
    </Tabs>
  ),
}

export const Vertical: StoryObj = {
  render: () => (
    <Tabs defaultValue="cars" orientation="vertical">
      <Tabs.List>
        <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        <Tabs.Trigger value="bicycles">Bicycles</Tabs.Trigger>
        <Tabs.Trigger value="skates">Skates</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="cars">Cars contents</Tabs.Content>
      <Tabs.Content value="bicycles">Bicycles contents</Tabs.Content>
      <Tabs.Content value="skates">Skates contents</Tabs.Content>
    </Tabs>
  ),
}

export const Pill: StoryObj = {
  render: () => (
    <Tabs defaultValue="cars">
      <Tabs.List variant="pill">
        <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        <Tabs.Trigger value="bicycles">Bicycles</Tabs.Trigger>
        <Tabs.Trigger value="skates">Skates</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="cars">
        <div className="pt-4">Cars contents</div>
      </Tabs.Content>
      <Tabs.Content value="bicycles">
        <div className="pt-4">Bicycles contents</div>
      </Tabs.Content>
      <Tabs.Content value="skates">
        <div className="pt-4">Skates contents</div>
      </Tabs.Content>
    </Tabs>
  ),
}

export const PillVertical: StoryObj = {
  render: () => (
    <Tabs defaultValue="cars" orientation="vertical">
      <Tabs.List variant="pill">
        <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        <Tabs.Trigger value="bicycles">Bicycles</Tabs.Trigger>
        <Tabs.Trigger value="skates">Skates</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="cars">
        <div className="pt-4">Cars contents</div>
      </Tabs.Content>
      <Tabs.Content value="bicycles">
        <div className="pt-4">Bicycles contents</div>
      </Tabs.Content>
      <Tabs.Content value="skates">
        <div className="pt-4">Skates contents</div>
      </Tabs.Content>
    </Tabs>
  ),
}

export const Disabled: StoryObj = {
  render: () => (
    <Tabs defaultValue="cars">
      <Tabs.List>
        <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        <Tabs.Trigger value="bicycles" disabled>
          Bicycles
        </Tabs.Trigger>
        <Tabs.Trigger value="skates">Skates</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="cars">
        <div className="pt-4">Cars contents</div>
      </Tabs.Content>
      <Tabs.Content value="bicycles">
        <div className="pt-4">Bicycles contents</div>
      </Tabs.Content>
      <Tabs.Content value="skates">
        <div className="pt-4">Skates contents</div>
      </Tabs.Content>
    </Tabs>
  ),
}
