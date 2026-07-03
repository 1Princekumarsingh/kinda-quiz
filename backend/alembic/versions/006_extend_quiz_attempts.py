"""extend quiz_attempts table with detailed tracking fields

Revision ID: 006
Revises: 005
Create Date: 2024-07-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to quiz_attempts table for extended tracking
    op.add_column('quiz_attempts', sa.Column('timer_mode', sa.String(), nullable=True))
    op.add_column('quiz_attempts', sa.Column('timer_value', sa.Integer(), nullable=True))
    op.add_column('quiz_attempts', sa.Column('question_range_start', sa.Integer(), nullable=True))
    op.add_column('quiz_attempts', sa.Column('question_range_end', sa.Integer(), nullable=True))
    op.add_column('quiz_attempts', sa.Column('batch_size', sa.Integer(), nullable=True))
    op.add_column('quiz_attempts', sa.Column('unanswered_questions', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('quiz_attempts', sa.Column('responses', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove added columns
    op.drop_column('quiz_attempts', 'responses')
    op.drop_column('quiz_attempts', 'unanswered_questions')
    op.drop_column('quiz_attempts', 'batch_size')
    op.drop_column('quiz_attempts', 'question_range_end')
    op.drop_column('quiz_attempts', 'question_range_start')
    op.drop_column('quiz_attempts', 'timer_value')
    op.drop_column('quiz_attempts', 'timer_mode')
