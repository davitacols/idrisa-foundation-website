import { NextRequest, NextResponse } from 'next/server'
import { initializeOlympiadDatabase, checkDatabaseStatus } from '@/lib/olympiad-v2/database'

export async function GET() {
  try {
    const status = await checkDatabaseStatus()
    
    return NextResponse.json({
      initialized: status.initialized,
      tables: status.tables,
      message: status.initialized 
        ? 'Database is fully initialized' 
        : 'Database needs initialization'
    })
  } catch (error) {
    console.error('Failed to check database status:', error)
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const result = await initializeOlympiadDatabase()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}
